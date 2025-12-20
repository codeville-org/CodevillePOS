import * as fs from "node:fs/promises";
import path from "path";

import {
  deleteImageController,
  getImageAsBase64Controller,
  getImagesDirectory,
  saveImageFromBase64Controller,
  saveImageFromBufferController,
  saveImageFromPathController
} from "@/controllers/images.controller";

export class ImageManager {
  private imagesDir: string;

  constructor() {
    this.imagesDir = getImagesDirectory();
  }

  private getImagesDir(): string {
    if (!this.imagesDir) {
      this.imagesDir = getImagesDirectory();
    }
    return this.imagesDir;
  }

  async initialize(): Promise<void> {
    try {
      this.imagesDir = getImagesDirectory();

      await fs.mkdir(this.imagesDir, { recursive: true });
      console.log(`Images directory initialized at: ${this.imagesDir}`);
    } catch (error) {
      console.error("Failed to initialize images directory:", error);
      throw error;
    }
  }

  async saveImageFromPath(sourceImagePath: string): Promise<string> {
    return saveImageFromPathController(sourceImagePath);
  }

  async saveImageFromBuffer(
    imageBuffer: Buffer,
    originalPath?: string
  ): Promise<string> {
    return saveImageFromBufferController(imageBuffer, originalPath);
  }

  async saveImageFromBase64(
    base64Data: string,
    billImage?: boolean,
    labelImage?: boolean,
    transactionNumber?: string
  ): Promise<string> {
    return saveImageFromBase64Controller(
      base64Data,
      billImage,
      labelImage,
      transactionNumber
    );
  }

  async getImageAsBase64(filename: string): Promise<string | null> {
    return getImageAsBase64Controller(filename);
  }

  getImagePath(filename: string): string {
    return path.join(this.getImagesDir(), filename);
  }

  async deleteImage(filename: string): Promise<boolean> {
    return deleteImageController(filename);
  }
}

// Create singleton instance
const imageManager = new ImageManager();

export { imageManager };
export default imageManager;
