import {
  ALIGNMENT_OPTIONS,
  PrinterConfig,
  ReceiptData,
  USBPrinter
} from "@/modules/printer/services/printer-service";
import { dialog } from "electron";
import path from "path";

import type {
  ListPrintersResponseT,
  VoidDataResponseT
} from "@/lib/zod/printers.zod";
import {
  getBillsImageDirectory,
  getImagesDirectory,
  getLabelsImageDirectory
} from "./images.controller";
import { getAppSettingsController } from "./settings.controller";

let printerInstance: USBPrinter | null = null;
let labelPrinterInstance: USBPrinter | null = null;

let printerSettings: PrinterConfig = {
  printerName: "XP-80C", // Windows
  devicePath: "/dev/usb/lp0" // Linux/Mac
};

let labelPrinterSettings: PrinterConfig = {
  printerName: "XP-420B", // Windows
  devicePath: "/dev/usb/lp0" // Linux/Mac
};

// Initialize Printer
async function getPrinter(): Promise<USBPrinter> {
  if (!printerInstance) {
    let defaultPrinter = "XP-80C"; // Fallback printer name is set to "XP-80C"
    const res = await getAppSettingsController();

    if (res.data && res.success) {
      defaultPrinter = res.data.defaultPrinter;
    }

    printerInstance = new USBPrinter({
      ...printerSettings,
      printerName: defaultPrinter
    });
  }

  return printerInstance;
}

async function getLabelPrinter(): Promise<USBPrinter> {
  if (!labelPrinterInstance) {
    let defaultLabelPrinter = "XP-420B"; // Fallback printer name is set to "XP-420B"
    const res = await getAppSettingsController();

    if (res.data && res.success) {
      defaultLabelPrinter = res.data.defaultLabelPrinter;
    }

    labelPrinterInstance = new USBPrinter({
      ...labelPrinterSettings,
      printerName: defaultLabelPrinter
    });
  }

  return labelPrinterInstance;
}

// Controllers

// ---- Print Receipt Controller
export async function printReceiptController(
  receipt: ReceiptData
): Promise<VoidDataResponseT> {
  try {
    const printer = await getPrinter();

    await printer.printReceipt(receipt);

    return { success: true };
  } catch (error) {
    return {
      data: null,
      success: false,
      error:
        (error as Error).message ||
        "An unknown error occurred while printing the receipt."
    };
  }
}

// ---- Test Printer Controller
export async function testPrinterController(
  config: PrinterConfig
): Promise<boolean> {
  try {
    printerSettings = { ...printerSettings, ...config };
    printerInstance = null;

    const printer = await getPrinter();
    const result = await printer.testConnection();

    return result;
  } catch (error) {
    return false;
  }
}

// ---- Open Cash Drawer Controller
export async function openCashDrawerController(): Promise<VoidDataResponseT> {
  try {
    const printer = await getPrinter();
    await printer.openCashDrawer();

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        (error as Error).message ||
        "An unknown error occurred while opening the cash drawer."
    };
  }
}

// ---- Get Available Printers Controller
export async function getAvailablePrintersController(): Promise<ListPrintersResponseT> {
  try {
    const printers = await USBPrinter.getAvailablePrinters();

    let response: ListPrintersResponseT["data"] = {
      printers: printers.map((name) => ({ name }))
    };

    const defaultPrinterRes = await getAppSettingsController();

    if (defaultPrinterRes.data && defaultPrinterRes.success) {
      const defaultPrinter = defaultPrinterRes.data.defaultPrinter;

      // Filtered array
      const filtered = response.printers.map((printer) => ({
        ...printer,
        isDefault: printer.name === defaultPrinter
      }));

      response.printers = filtered;
    }

    return {
      data: response,
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as Error).message ||
        "An unknown error occurred while opening the cash drawer."
    };
  }
}

// ---- Get platform Controller
export async function getPlatformController(): Promise<string> {
  return process.platform;
}

// ---- Save printer settings controller
// Not using currently
export async function savePrinterSettingsController(
  settings: PrinterConfig
): Promise<VoidDataResponseT> {
  try {
    printerSettings = { ...printerSettings, ...settings };
    printerInstance = null; // Reset instance

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error:
        (error as Error).message ||
        "An unknown error occurred while opening the cash drawer."
    };
  }
}

// ---- Print Image Controller
export async function printImageController(
  imagePath: string,
  align?: ALIGNMENT_OPTIONS,
  useDithering?: boolean
): Promise<VoidDataResponseT> {
  try {
    const printer = await getPrinter();

    // If imagePath is just a filename, resolve it to full path
    let fullImagePath = imagePath;
    if (!path.isAbsolute(imagePath)) {
      fullImagePath = path.join(getImagesDirectory(), imagePath);
    }

    await printer.printImage(fullImagePath, align || "center", useDithering);

    return { success: true };
  } catch (error) {
    return {
      error:
        (error as Error).message ||
        "An unknown error occurred while printing the image.",
      success: false
    };
  }
}

// ---- Print Image Bill Controller
export async function printImageBillController(
  imagePath: string,
  useDithering?: boolean
): Promise<VoidDataResponseT> {
  try {
    const printer = await getPrinter();

    // If imagePath is just a filename, resolve it to full path
    // For bill images, check bills directory first, then images directory
    let fullImagePath = imagePath;
    if (!path.isAbsolute(imagePath)) {
      // Try bills directory first (for bill images)
      const billPath = path.join(getBillsImageDirectory(), imagePath);
      const imageDirPath = path.join(getImagesDirectory(), imagePath);

      // Use bills directory if file starts with "bill_", otherwise use images directory
      fullImagePath = imagePath.startsWith("bill_") ? billPath : imageDirPath;
    }

    console.log(`Attempting to print bill image from: ${fullImagePath}`);

    await printer.printImageBill(fullImagePath, useDithering);

    return { success: true };
  } catch (error) {
    console.error("Print image bill error:", error);
    return {
      error:
        (error as Error).message ||
        "An unknown error occurred while printing the bill image.",
      success: false
    };
  }
}

export async function printImageLabelController(
  imagePath: string,
  useDithering?: boolean
): Promise<VoidDataResponseT> {
  try {
    const printer = await getLabelPrinter();

    // If imagePath is just a filename, resolve it to full path
    // For bill images, check bills directory first, then images directory
    let fullImagePath = imagePath;
    if (!path.isAbsolute(imagePath)) {
      // Try bills directory first (for bill images)
      const labelsPath = path.join(getLabelsImageDirectory(), imagePath);
      const imageDirPath = path.join(getImagesDirectory(), imagePath);

      // Use bills directory if file starts with "bill_", otherwise use images directory
      fullImagePath = imagePath.startsWith("label_")
        ? labelsPath
        : imageDirPath;
    }

    console.log(`Attempting to print label image from: ${fullImagePath}`);

    await printer.printImageLabel(fullImagePath, useDithering);

    return { success: true };
  } catch (error) {
    console.error("Print image label error:", error);
    return {
      error:
        (error as Error).message ||
        "An unknown error occurred while printing the label image.",
      success: false
    };
  }
}

// ---- Select Image File
export async function selectImageFileController(): Promise<string | null> {
  try {
    const result = await dialog.showOpenDialog({
      properties: ["openFile"],
      filters: [
        { name: "Images", extensions: ["png", "jpg", "jpeg", "bmp", "gif"] }
      ]
    });

    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }

    return result.filePaths[0];
  } catch (error) {
    return null;
  }
}
