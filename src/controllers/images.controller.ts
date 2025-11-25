import { createId } from "@paralleldrive/cuid2";
import { app } from "electron";
import * as fs from "node:fs/promises";
import path from "path";

import type {
  CopyImagesFromDirectoryResponse,
  ListImagesInDirectoryResponse,
  SelectImageDirectoryResponse
} from "@/lib/zod/images.zod";

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

export function getLabelsImageDirectory(): string {
  let baseDir: string;

  if (!app.isReady()) {
    return path.join(process.cwd(), "images");
  }

  if (app.isPackaged) {
    baseDir = app.getPath("documents");
    return path.join(baseDir, "CodeVille POS", "labels");
  } else {
    baseDir = process.cwd();
    return path.join(baseDir, "labels");
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
  labelImage?: boolean,
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

    if (labelImage) {
      filename = `label_${fileId}${extension}`;
    }

    let imagesDirectory;

    if (billImage) {
      imagesDirectory = getBillsImageDirectory();
    } else if (labelImage) {
      imagesDirectory = getLabelsImageDirectory();
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

// ---- Select Image Directory Controller ----
export async function selectImageDirectoryController(): Promise<SelectImageDirectoryResponse> {
  try {
    const { dialog, BrowserWindow } = await import("electron");
    const focusedWindow = BrowserWindow.getFocusedWindow();

    const result = await dialog.showOpenDialog(focusedWindow!, {
      properties: ["openDirectory"],
      title: "Select Image Directory"
    });

    if (result.canceled || result.filePaths.length === 0) {
      return {
        success: false,
        error: "Directory selection was canceled"
      };
    }

    return {
      success: true,
      directoryPath: result.filePaths[0]
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || "Failed to select directory"
    };
  }
}

// ---- List Images in Directory Controller ----
export async function listImagesInDirectoryController(
  directoryPath: string
): Promise<ListImagesInDirectoryResponse> {
  try {
    // Read directory contents
    const entries = await fs.readdir(directoryPath, { withFileTypes: true });

    // Filter for image files
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];
    const images = entries
      .filter((entry) => {
        if (!entry.isFile()) return false;
        const ext = path.extname(entry.name).toLowerCase();
        return validExtensions.includes(ext);
      })
      .map((entry) => entry.name);

    return {
      success: true,
      images
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || "Failed to list images in directory"
    };
  }
}

// ---- Copy Images from Directory Controller ----
export async function copyImagesFromDirectoryController(
  sourceDirectoryPath: string
): Promise<CopyImagesFromDirectoryResponse> {
  try {
    const targetDirectory = getImagesDirectory();

    // Ensure target directory exists
    await fs.mkdir(targetDirectory, { recursive: true });

    // Get list of images in source directory
    const listResult =
      await listImagesInDirectoryController(sourceDirectoryPath);

    if (!listResult.success || !listResult.images) {
      throw new Error(listResult.error || "Failed to list images");
    }

    let copiedCount = 0;

    // Copy each image
    for (const imageName of listResult.images) {
      const sourcePath = path.join(sourceDirectoryPath, imageName);
      const targetPath = path.join(targetDirectory, imageName);

      try {
        // Check if file already exists
        const exists = await fs
          .access(targetPath)
          .then(() => true)
          .catch(() => false);

        if (!exists) {
          await fs.copyFile(sourcePath, targetPath);
          copiedCount++;
        }
      } catch (error) {
        console.error(`Failed to copy ${imageName}:`, error);
        // Continue with other files even if one fails
      }
    }

    return {
      success: true,
      copiedCount
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || "Failed to copy images from directory"
    };
  }
}
