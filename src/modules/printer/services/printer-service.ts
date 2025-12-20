import {
  getBillsImageDirectory,
  getLabelsImageDirectory
} from "@/controllers/images.controller";
import * as fs from "fs";
import sharp from "sharp";
import { promisify } from "util";

const writeFile = promisify(fs.writeFile);
// const readFile = promisify(fs.readFile);

type ALIGNMENT_OPTIONS = "left" | "center" | "right";

interface PrinterConfig {
  devicePath?: string;
  printerName?: string;
}

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  unit?: string;
}

interface ReceiptData {
  storeName?: string;
  storeAddress?: string;
  logoPath?: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  timestamp?: Date;
}

export class USBPrinter {
  private config: PrinterConfig;
  private platform: NodeJS.Platform;

  // ESC/POS Commands
  private readonly ESC = "\x1B";
  private readonly GS = "\x1D";

  // Text formatting
  private readonly INIT = `${this.ESC}@`;
  private readonly BOLD_ON = `${this.ESC}E1`;
  private readonly BOLD_OFF = `${this.ESC}E0`;
  private readonly ALIGN_LEFT = `${this.ESC}a0`;
  private readonly ALIGN_CENTER = `${this.ESC}a1`;
  private readonly ALIGN_RIGHT = `${this.ESC}a2`;
  private readonly FONT_NORMAL = `${this.ESC}!0`;
  private readonly FONT_LARGE = `${this.ESC}!16`;
  private readonly FONT_SMALL = `${this.ESC}!1`;

  // Paper control
  private readonly CUT_PAPER = `${this.GS}V1`;
  private readonly FEED_LINE = "\n";
  private readonly FEED_LINES = (lines: number) =>
    `${this.ESC}d${String.fromCharCode(lines)}`;

  constructor(config: PrinterConfig) {
    this.config = config;
    this.platform = process.platform;

    console.log("Printer initialized with Sharp image processing");
  }

  private async sendToPrinter(data: Buffer): Promise<void> {
    if (this.platform === "win32") {
      return this.sendToWindowsPrinter(data);
    } else {
      return this.sendToUnixPrinter(data);
    }
  }

  private async sendToWindowsPrinter(data: Buffer): Promise<void> {
    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);
    const os = require("os");
    const path = require("path");

    const tempFile = path.join(os.tmpdir(), `receipt_${Date.now()}.bin`);

    try {
      await writeFile(tempFile, data);
      const printerName = this.config.printerName || "XP-80C";
      const command = `copy /B "${tempFile}" "\\\\localhost\\${printerName}"`;
      await execAsync(command);
      fs.unlinkSync(tempFile);
    } catch (error) {
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile);
      }
      throw new Error(
        `Windows printer error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  private async sendToUnixPrinter(data: Buffer): Promise<void> {
    const devicePath = this.config.devicePath || "/dev/usb/lp0";

    try {
      await writeFile(devicePath, data);
    } catch (error) {
      throw new Error(
        `USB printer error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async printReceipt(receipt: ReceiptData): Promise<void> {
    const buffer: string[] = [];

    buffer.push(this.INIT);

    if (receipt.logoPath) {
      try {
        const imageData = await this.prepareImage(receipt.logoPath);
        buffer.push(this.ALIGN_CENTER);
        buffer.push(imageData);
        buffer.push(this.FEED_LINE);
      } catch (error) {
        console.error("Failed to print logo:", error);
      }
    }

    if (receipt.storeName) {
      buffer.push(this.ALIGN_CENTER);
      buffer.push(this.FONT_LARGE);
      buffer.push(this.BOLD_ON);
      buffer.push(receipt.storeName);
      buffer.push(this.FEED_LINE);
      buffer.push(this.BOLD_OFF);
      buffer.push(this.FONT_NORMAL);
    }

    if (receipt.storeAddress) {
      buffer.push(this.ALIGN_CENTER);
      buffer.push(this.FONT_SMALL);
      buffer.push(receipt.storeAddress);
      buffer.push(this.FEED_LINE);
      buffer.push(this.FONT_NORMAL);
    }

    const timestamp = receipt.timestamp || new Date();
    buffer.push(`Date: ${timestamp.toLocaleDateString()}`);
    buffer.push(this.FEED_LINE);
    buffer.push(`Time: ${timestamp.toLocaleTimeString()}`);
    buffer.push(this.FEED_LINE);
    buffer.push("-".repeat(48));
    buffer.push(this.FEED_LINE);

    buffer.push(this.BOLD_ON);
    buffer.push(this.formatTableHeader());
    buffer.push(this.FEED_LINE);
    buffer.push(this.BOLD_OFF);
    buffer.push("-".repeat(48));
    buffer.push(this.FEED_LINE);

    receipt.items.forEach((item, index) => {
      buffer.push(this.BOLD_ON);
      buffer.push(`${index + 1}. ${item.name}`);
      buffer.push(this.BOLD_OFF);
      buffer.push(this.FEED_LINE);

      const detailsLine = this.formatItemDetailsRow(
        item.quantity,
        item.unit || "",
        item.price,
        item.quantity * item.price
      );
      buffer.push(detailsLine);
      buffer.push(this.FEED_LINE);
    });

    buffer.push(this.ALIGN_CENTER);
    buffer.push(this.FEED_LINE);
    buffer.push("Thank you for your business!");
    buffer.push(this.FEED_LINE);

    buffer.push(this.FEED_LINES(5));
    buffer.push(this.CUT_PAPER);

    const data = Buffer.from(buffer.join(""), "binary");
    await this.sendToPrinter(data);
  }

  async printText(text: string, cut: boolean = true): Promise<void> {
    const buffer: string[] = [];

    buffer.push(this.INIT);
    buffer.push(text);
    buffer.push(this.FEED_LINE);

    if (cut) {
      buffer.push(this.FEED_LINES(3));
      buffer.push(this.CUT_PAPER);
    }

    const data = Buffer.from(buffer.join(""), "binary");
    await this.sendToPrinter(data);
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.printText("Test Print - Connection OK", true);
      return true;
    } catch (error) {
      console.error("Printer test failed:", error);
      return false;
    }
  }

  static async getAvailablePrinters(): Promise<string[]> {
    if (process.platform !== "win32") {
      return [];
    }

    const { exec } = require("child_process");
    const { promisify } = require("util");
    const execAsync = promisify(exec);

    try {
      const { stdout } = await execAsync('cmd /c "net view \\\\localhost"');

      // Parse the output to extract shared printers
      const lines = stdout.split("\n");
      const printers: string[] = [];

      let inShareSection = false;
      for (const line of lines) {
        const trimmedLine = line.trim();

        // Look for the separator line that indicates start of shares
        if (trimmedLine.includes("---------------")) {
          inShareSection = true;
          continue;
        }

        // Skip if we haven't reached the share section yet
        if (!inShareSection) continue;

        // Empty line typically marks end of shares
        if (trimmedLine === "") break;

        // Parse each share line
        const parts = trimmedLine.split(/\s+/);
        if (parts.length >= 2 && parts[1] === "Print") {
          // First part is the share name, second part is "Print"
          printers.push(parts[0]);
        }
      }

      return printers;
    } catch (error) {
      console.error("Failed to get shared printer list:", error);
      return [];
    }
  }

  private formatTableHeader(): string {
    const col1 = "Quantity".padEnd(16);
    const col2 = "Unit Price".padEnd(16);
    const col3 = "Total".padEnd(16);
    return `${col1}${col2}${col3}`;
  }

  private formatItemDetailsRow(
    qty: number,
    unit: string,
    unitPrice: number,
    total: number
  ): string {
    const qtyStr = `${qty} ${unit}`.padEnd(16);
    const priceStr = `Rs. ${unitPrice.toFixed(2)}`.padEnd(16);
    const totalStr = `Rs. ${total.toFixed(2)}`.padEnd(16);
    return `${qtyStr}${priceStr}${totalStr}`;
  }

  async openCashDrawer(): Promise<void> {
    const OPEN_DRAWER = `${this.ESC}p0\x19\xFA`;
    const data = Buffer.from(OPEN_DRAWER, "binary");
    await this.sendToPrinter(data);
  }

  /**
   * Prepare bill image for printing using Sharp (converts to ESC/POS bitmap)
   * Specialized for bill printing to avoid horizontal padding
   */
  private async prepareBillImage(
    imagePath: string,
    maxWidth: number = 576,
    useDithering: boolean = true
  ): Promise<string> {
    try {
      console.log(`Preparing image with Sharp: ${imagePath}`);

      if (!fs.existsSync(imagePath)) {
        console.error(`Image file not found: ${imagePath}`);
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Load and process image with Sharp
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      console.log(`Original image: ${metadata.width}x${metadata.height}`);

      // For bills, maintain width at maxWidth and scale height proportionally
      let width = maxWidth;
      let height = metadata.height || 100;

      if (metadata.width && metadata.width !== maxWidth) {
        const ratio = maxWidth / metadata.width;
        height = Math.floor(height * ratio);
      }

      // Ensure dimensions are reasonable for thermal printer
      width = Math.max(1, Math.min(width, 576));
      height = Math.max(1, height); // No height limit for bills

      console.log(`Processing image at: ${width}x${height}`);

      // Process image: resize without fit constraints to avoid padding
      const processedImage = await image
        .resize(width, height, {
          kernel: sharp.kernel.lanczos3,
          withoutEnlargement: false
        })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data: pixelData, info } = processedImage;

      console.log(`Sharp processing complete: ${info.width}x${info.height}`);

      // Convert to monochrome bitmap
      const bitmapData = this.convertToBitmap(
        pixelData,
        info.width,
        info.height,
        useDithering
      );

      console.log(
        `✓ Bitmap conversion completed, data length: ${bitmapData.length}`
      );

      return bitmapData;
    } catch (error) {
      console.error("Error preparing bill image:", error);
      throw new Error(
        `Failed to prepare bill image: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Prepare bill image for printing using Sharp (converts to ESC/POS bitmap)
   * Specialized for bill printing to avoid horizontal padding
   */
  private async prepareLabelImage(
    imagePath: string,
    maxWidth: number = 638,
    useDithering: boolean = true
  ): Promise<string> {
    try {
      console.log(`Preparing image with Sharp: ${imagePath}`);

      if (!fs.existsSync(imagePath)) {
        console.error(`Image file not found: ${imagePath}`);
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Load and process image with Sharp
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      console.log(`Original image: ${metadata.width}x${metadata.height}`);

      // For bills, maintain width at maxWidth and scale height proportionally
      let width = maxWidth;
      let height = metadata.height || 100;

      if (metadata.width && metadata.width !== maxWidth) {
        const ratio = maxWidth / metadata.width;
        height = Math.floor(height * ratio);
      }

      // Ensure dimensions are reasonable for thermal printer
      width = Math.max(1, Math.min(width, 576));
      height = Math.max(1, height); // No height limit for bills

      console.log(`Processing image at: ${width}x${height}`);

      // Process image: resize without fit constraints to avoid padding
      const processedImage = await image
        .resize(width, height, {
          kernel: sharp.kernel.lanczos3,
          withoutEnlargement: false
        })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data: pixelData, info } = processedImage;

      console.log(`Sharp processing complete: ${info.width}x${info.height}`);

      // Convert to monochrome bitmap
      const bitmapData = this.convertToBitmap(
        pixelData,
        info.width,
        info.height,
        useDithering
      );

      console.log(
        `✓ Bitmap conversion completed, data length: ${bitmapData.length}`
      );

      return bitmapData;
    } catch (error) {
      console.error("Error preparing bill image:", error);
      throw new Error(
        `Failed to prepare bill image: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Prepare image for printing using Sharp (converts to ESC/POS bitmap)
   */
  private async prepareImage(
    imagePath: string,
    maxWidth: number = 384,
    useDithering: boolean = true
  ): Promise<string> {
    try {
      console.log(`Preparing image with Sharp: ${imagePath}`);

      if (!fs.existsSync(imagePath)) {
        console.error(`Image file not found: ${imagePath}`);
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Load and process image with Sharp
      const image = sharp(imagePath);
      const metadata = await image.metadata();

      console.log(`Original image: ${metadata.width}x${metadata.height}`);

      // Calculate dimensions (maintain aspect ratio)
      let width = metadata.width || maxWidth;
      let height = metadata.height || 100;

      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.floor(height * ratio);
      }

      // Ensure dimensions are reasonable
      width = Math.max(1, Math.min(width, 576));
      height = Math.max(1, Math.min(height, 1000));

      console.log(`Processing image at: ${width}x${height}`);

      // Process image: resize, convert to grayscale, and get raw pixel data
      const processedImage = await image
        .resize(width, height, {
          fit: "contain",
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data: pixelData, info } = processedImage;

      console.log(`Sharp processing complete: ${info.width}x${info.height}`);

      // Convert to monochrome bitmap
      const bitmapData = this.convertToBitmap(
        pixelData,
        info.width,
        info.height,
        useDithering
      );

      console.log(
        `✓ Bitmap conversion completed, data length: ${bitmapData.length}`
      );

      return bitmapData;
    } catch (error) {
      console.error("Prepare image error:", error);
      throw new Error(
        `Failed to prepare image: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Convert grayscale image data to ESC/POS bitmap format with optional dithering
   */
  private convertToBitmap(
    imageData: Buffer,
    width: number,
    height: number,
    useDithering: boolean = true
  ): string {
    const buffer: string[] = [];

    // ESC/POS raster image command: GS v 0
    buffer.push(this.GS);
    buffer.push("v");
    buffer.push("0");
    buffer.push("\x00"); // Normal mode

    // Width in bytes (8 pixels per byte)
    const widthBytes = Math.ceil(width / 8);
    buffer.push(String.fromCharCode(widthBytes & 0xff));
    buffer.push(String.fromCharCode((widthBytes >> 8) & 0xff));

    // Height
    buffer.push(String.fromCharCode(height & 0xff));
    buffer.push(String.fromCharCode((height >> 8) & 0xff));

    // Create a copy of image data for dithering
    // Sharp gives us grayscale values (1 byte per pixel)
    const pixels = new Float32Array(width * height);

    // Copy grayscale values to float array
    for (let i = 0; i < width * height; i++) {
      pixels[i] = imageData[i];
    }

    // Apply Floyd-Steinberg dithering if enabled
    if (useDithering) {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = y * width + x;
          const oldPixel = pixels[index];
          const newPixel = oldPixel < 128 ? 0 : 255;
          pixels[index] = newPixel;

          const error = oldPixel - newPixel;

          // Distribute error to neighboring pixels
          if (x + 1 < width) {
            pixels[index + 1] += (error * 7) / 16;
          }
          if (y + 1 < height) {
            if (x > 0) {
              pixels[index + width - 1] += (error * 3) / 16;
            }
            pixels[index + width] += (error * 5) / 16;
            if (x + 1 < width) {
              pixels[index + width + 1] += (error * 1) / 16;
            }
          }
        }
      }
    } else {
      // Simple thresholding without dithering
      for (let i = 0; i < pixels.length; i++) {
        pixels[i] = pixels[i] < 128 ? 0 : 255;
      }
    }

    // Convert pixels to bitmap
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < widthBytes; x++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
          const pixelX = x * 8 + bit;
          if (pixelX < width) {
            const index = y * width + pixelX;
            const pixelValue = pixels[index];

            // If pixel is dark (< 128), set bit to 1 (print black)
            if (pixelValue < 128) {
              byte |= 1 << (7 - bit);
            }
          }
        }
        buffer.push(String.fromCharCode(byte));
      }
    }

    return buffer.join("");
  }

  async printImage(
    imagePath: string,
    align: ALIGNMENT_OPTIONS = "center",
    useDithering: boolean = true
  ): Promise<void> {
    const buffer: string[] = [];

    buffer.push(this.INIT);

    if (align === "center") {
      buffer.push(this.ALIGN_CENTER);
    } else if (align === "right") {
      buffer.push(this.ALIGN_RIGHT);
    } else {
      buffer.push(this.ALIGN_LEFT);
    }

    const imageData = await this.prepareImage(imagePath, 384, useDithering);
    buffer.push(imageData);
    buffer.push(this.FEED_LINE);

    const data = Buffer.from(buffer.join(""), "binary");
    await this.sendToPrinter(data);
  }

  async printImageBill(
    imagePath: string,
    useDithering: boolean = true
  ): Promise<void> {
    const buffer: string[] = [];

    buffer.push(this.INIT);
    buffer.push(this.ALIGN_LEFT);

    const fullWidth = 576;

    const path = require("path");
    let fullBillImagePath: string;

    if (path.isAbsolute(imagePath)) {
      fullBillImagePath = imagePath;
    } else {
      fullBillImagePath = path.join(getBillsImageDirectory(), imagePath);
    }

    try {
      if (!fs.existsSync(fullBillImagePath)) {
        throw new Error(`Image file not found at: ${fullBillImagePath}`);
      }

      console.log(`Printing bill image: ${fullBillImagePath}`);

      const imageData = await this.prepareBillImage(
        fullBillImagePath,
        fullWidth,
        useDithering
      );

      if (!imageData || imageData.length === 0) {
        throw new Error("Failed to generate image data");
      }

      buffer.push(imageData);
      buffer.push(this.FEED_LINES(3));
      buffer.push(this.CUT_PAPER);

      const data = Buffer.from(buffer.join(""), "binary");

      await this.sendToPrinter(data);

      console.log("✓ Bill printed successfully");
    } catch (error) {
      console.error("Error printing bill image:", error);
      throw new Error(
        `Failed to print bill image: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async printImageLabel(
    imagePath: string,
    useDithering: boolean = true
  ): Promise<void> {
    const buffer: string[] = [];

    buffer.push(this.INIT);
    buffer.push(this.ALIGN_LEFT);

    const fullWidth = 638;

    const path = require("path");
    let fullLabelImagePath: string;

    if (path.isAbsolute(imagePath)) {
      fullLabelImagePath = imagePath;
    } else {
      fullLabelImagePath = path.join(getLabelsImageDirectory(), imagePath);
    }

    try {
      if (!fs.existsSync(fullLabelImagePath)) {
        throw new Error(`Image file not found at: ${fullLabelImagePath}`);
      }

      console.log(`Printing bill image: ${fullLabelImagePath}`);

      const imageData = await this.prepareLabelImage(
        fullLabelImagePath,
        fullWidth,
        useDithering
      );

      if (!imageData || imageData.length === 0) {
        throw new Error("Failed to generate image data");
      }

      buffer.push(imageData);
      buffer.push(this.FEED_LINES(3));
      buffer.push(this.CUT_PAPER);

      const data = Buffer.from(buffer.join(""), "binary");

      await this.sendToPrinter(data);

      console.log("✓ Label printed successfully");
    } catch (error) {
      console.error("Error printing label image:", error);
      throw new Error(
        `Failed to print label image: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async debugImageProcessing(imagePath: string): Promise<void> {
    try {
      console.log("Debug: Processing image with Sharp");

      const image = sharp(imagePath);
      const metadata = await image.metadata();

      console.log("Image metadata:", metadata);

      // Save a debug version
      const debugPath = imagePath.replace(/\.[^/.]+$/, "_debug.png");

      await image
        .resize(384, null, { fit: "contain" })
        .grayscale()
        .toFile(debugPath);

      console.log(`Debug image saved to: ${debugPath}`);
    } catch (error) {
      console.error("Debug image processing failed:", error);
    }
  }
}

export type { ALIGNMENT_OPTIONS, PrinterConfig, ReceiptData, ReceiptItem };
