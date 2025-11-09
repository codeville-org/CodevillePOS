import { createId } from "@paralleldrive/cuid2";
import { app } from "electron";
import * as fs from "node:fs/promises";
import path from "path";

// This returns the images directory path
export function getImagesDirectory(): string {
  let baseDir: string;

  if (!app.isReady()) {
    return path.join(process.cwd(), "images");
  }

  if (app.isPackaged) {
    baseDir = app.getPath("documents");
    return path.join(baseDir, "CodeVille POS", "images");
  } else {
    baseDir = process.cwd();
    return path.join(baseDir, "images");
  }
}

export function getBillsImageDirectory(): string {
  let baseDir: string;

  if (!app.isReady()) {
    return path.join(process.cwd(), "images");
  }

  if (app.isPackaged) {
    baseDir = app.getPath("documents");
    return path.join(baseDir, "CodeVille POS", "bills");
  } else {
    baseDir = process.cwd();
    return path.join(baseDir, "bills");
  }
}

// This function ensures image extension is valid
export function isValidImageExtension(extension: string): boolean {
  const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  return validExtensions.includes(extension.toLowerCase());
}

// Save an image from a base64-encoded string
export async function saveImageFromBase64Controller(
  base64Data: string,
  billImage?: boolean,
  transactionNumber?: string
): Promise<string> {
  try {
    const matches = base64Data.match(
      /^data:image\/([a-zA-Z0-9]+);base64,(.+)$/
    );

    if (!matches) {
      throw new Error("Invalid base64 image format");
    }

    const [, imageType, base64String] = matches;
    const extension = `.${imageType.toLowerCase()}`;

    if (!isValidImageExtension(extension)) {
      throw new Error(
        "Invalid image format. Only jpg, jpeg, png, webp are supported."
      );
    }

    const imageBuffer = Buffer.from(base64String, "base64");
    const fileId = createId();

    let filename = `${fileId}${extension}`;

    if (billImage && transactionNumber) {
      filename = `bill_${transactionNumber}${extension}`;
    }

    let imagesDirectory;

    if (billImage) {
      imagesDirectory = getBillsImageDirectory();
    } else imagesDirectory = getImagesDirectory();

    await fs.mkdir(imagesDirectory, { recursive: true });

    const fullPath = path.join(imagesDirectory, filename);
    await fs.writeFile(fullPath, imageBuffer);
    return filename;
  } catch (error) {
    console.error("Failed to save image from base64:", error);
    throw error;
  }
}

// Save an image from a file path
export async function saveImageFromPathController(
  sourceImagePath: string
): Promise<string> {
  try {
    const imageBuffer = await fs.readFile(sourceImagePath);
    return await saveImageFromBufferController(imageBuffer, sourceImagePath);
  } catch (error) {
    console.error("Failed to save image from path: ", error);
    throw new Error("Failed to save image from file path");
  }
}

// Save an image from a buffer
export async function saveImageFromBufferController(
  imageBuffer: Buffer,
  originalPath?: string
): Promise<string> {
  try {
    const fileId = createId();
    const extension = originalPath
      ? path.extname(originalPath).toLowerCase()
      : ".jpg";

    const filename = `${fileId}${extension}`;
    const imagesDirectory = getImagesDirectory();

    if (!isValidImageExtension(extension)) {
      throw new Error("Invalid image format...");
    }

    // Ensure the directory exists before writing the file
    await fs.mkdir(imagesDirectory, { recursive: true });

    const fullPath = path.join(imagesDirectory, filename);
    await fs.writeFile(fullPath, imageBuffer);

    console.log(`Image saved: ${filename}`);
    return filename;
  } catch (error) {
    console.error("Failed to save image from buffer:", error);
    throw error;
  }
}

// Get an image as a base64-encoded string
export async function getImageAsBase64Controller(
  filename: string
): Promise<string | null> {
  try {
    const imagesDirectory = getImagesDirectory();
    const fullPath = path.join(imagesDirectory, filename);

    try {
      await fs.access(fullPath);
    } catch (error) {
      return null;
    }

    const imageBuffer = await fs.readFile(fullPath);
    const extension = path.extname(filename).toLowerCase();

    let mimeType = "image/jpeg";
    switch (extension) {
      case ".png":
        mimeType = "image/png";
        break;
      case ".webp":
        mimeType = "image/webp";
        break;
      case ".jpg":
      case ".jpeg":
        mimeType = "image/jpeg";
        break;
    }

    const base64String = imageBuffer.toString("base64");
    return `data:${mimeType};base64,${base64String}`;
  } catch (error) {
    console.error("Failed to get image as base64:", error);
    return null;
  }
}

// Delete an image
export async function deleteImageController(
  filename: string
): Promise<boolean> {
  try {
    const imagesDirectory = getImagesDirectory();
    const fullPath = path.join(imagesDirectory, filename);
    await fs.unlink(fullPath);
    console.log(`Image deleted: ${filename}`);
    return true;
  } catch (error) {
    console.error("Failed to delete image:", error);
    return false;
  }
}
