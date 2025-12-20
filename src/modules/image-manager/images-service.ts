export class ImageApiService {
  /**
   * Save image from base64 data URL
   */
  static async saveFromBase64(
    base64Data: string,
    billImage?: boolean,
    labelImage?: boolean,
    transactionNumber?: string
  ): Promise<string> {
    return await window.electronAPI.images.saveImageFromBase64(
      base64Data,
      billImage,
      labelImage,
      transactionNumber
    );
  }

  /**
   * Save image from file path
   */
  static async saveFromPath(imagePath: string): Promise<string> {
    return await window.electronAPI.images.saveImageFromPath(imagePath);
  }

  /**
   * Get image as base64 data URL by filename
   */
  static async getAsBase64(filename: string): Promise<string | null> {
    return await window.electronAPI.images.getImageAsBase64(filename);
  }

  /**
   * Delete image by filename
   */
  static async deleteImage(filename: string): Promise<boolean> {
    return await window.electronAPI.images.deleteImage(filename);
  }

  /**
   * Get images directory path
   */
  static async getDirectory(): Promise<string> {
    return await window.electronAPI.images.getImagesDirectory();
  }
}

export default ImageApiService;
