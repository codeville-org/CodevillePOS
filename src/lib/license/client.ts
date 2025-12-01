import { app, safeStorage } from "electron";
import * as fs from "fs";
import * as path from "path";

import {
  ActivationResponse,
  CheckLicense,
  GetLicenseInfo,
  LicenseData,
  ValidationResponse
} from "../zod/license.zod";
import { generateFingerprint } from "./hardware-fingerprint";

// ========= Configurations =========
const CONFIG = {
  LICENSE_SERVER_URL: "https://your-license-server.com/api",
  APP_SALT: "com.codeville.pos",
  VALIDATION_INTERVAL_DAYS: 30, // Re-validate every 30 days
  GRACE_PERIOD_DAYS: 365 // 365 days grace period after license expiry
};

// ========= License Manager =========
class LicenseManager {
  private licenseFilePath: string;
  private cachedLicense: LicenseData | null = null;

  constructor() {
    const userDataPath = app.getPath("userData");
    this.licenseFilePath = path.join(userDataPath, ".license");
  }

  /**
   * Get the hardware fingerprint for this device
   */
  getHardwareId(): string {
    return generateFingerprint({ salt: CONFIG.APP_SALT });
  }

  /**
   * Save license data securely to disk
   * Uses Electron's safeStorage for encryption when available
   */
  private saveLicense(license: LicenseData): void {
    const data = JSON.stringify(license);

    try {
      if (safeStorage.isEncryptionAvailable()) {
        // Encrypt using OS-level encryption (Keychain, DPAPI, etc.)
        const encrypted = safeStorage.encryptString(data);
        fs.writeFileSync(this.licenseFilePath, encrypted);
      } else {
        // Fallback: basic obfuscation (not secure, but better than plaintext)
        const obfuscated = Buffer.from(data).toString("base64");
        fs.writeFileSync(this.licenseFilePath, obfuscated);
      }

      this.cachedLicense = license;
    } catch (error) {
      console.error("Failed to save license:", error);
      throw new Error("LICENSE_SAVE_FAILED");
    }
  }

  /**
   * Load license data from disk
   */
  private loadLicense(): LicenseData | null {
    if (this.cachedLicense) {
      return this.cachedLicense;
    }

    try {
      if (!fs.existsSync(this.licenseFilePath)) {
        return null;
      }

      const fileContent = fs.readFileSync(this.licenseFilePath);

      let data: string;
      if (safeStorage.isEncryptionAvailable()) {
        data = safeStorage.decryptString(fileContent);
      } else {
        data = Buffer.from(fileContent.toString(), "base64").toString("utf-8");
      }

      this.cachedLicense = JSON.parse(data) as LicenseData;
      return this.cachedLicense;
    } catch (error) {}
  }

  /**
   * Clear stored license data
   */
  clearLicense(): void {
    try {
      if (fs.existsSync(this.licenseFilePath)) {
        fs.unlinkSync(this.licenseFilePath);
      }

      this.cachedLicense = null;
    } catch (error) {
      console.error("Failed to clear license:", (error as Error).message);
    }
  }

  /**
   * Activate a new license
   */
  async activate(serialKey: string): Promise<ActivationResponse> {
    const hardwareId = this.getHardwareId();

    try {
      const response = await fetch(
        `${CONFIG.LICENSE_SERVER_URL}/license/activate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serialKey: serialKey.trim().toUpperCase(),
            hardwareId,
            appVersion: app.getVersion()
          })
        }
      );

      const result: ActivationResponse = await response.json();

      if (result.success && result.data) {
        this.saveLicense({
          serialKey: result.data.serialKey,
          hardwareId,
          activatedAt: result.data.activatedAt,
          expiresAt: result.data.expiresAt,
          lastValidated: new Date().toISOString()
        });
      }

      return result;
    } catch (error) {
      console.error("Activation failed:", error);
      return { success: false, error: "NETWORK_ERROR" };
    }
  }

  /**
   * Validate existing license with server
   */
  async validateOnline(): Promise<ValidationResponse> {
    const license = this.loadLicense();

    if (!license) {
      return { success: false, error: "NO_LICENSE" };
    }

    const hardwareId = this.getHardwareId();

    if (license.hardwareId !== hardwareId) {
      this.clearLicense();
      return { success: false, error: "HARDWARE_MISMATCH" };
    }

    try {
      const response = await fetch(
        `${CONFIG.LICENSE_SERVER_URL}/license/validate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serialKey: license.serialKey,
            hardwareId
          })
        }
      );

      const result: ValidationResponse = await response.json();

      if (result.success && result.data) {
        this.saveLicense({
          ...license,
          lastValidated: new Date().toISOString()
        });
      } else {
        this.clearLicense();
      }

      return result;
    } catch (error) {
      // Network error - fall back to offline validation
      console.warn("Online validation failed, using offline:", error);
      return this.validateOffline();
    }
  }

  /**
   * Validate license offline using cached data
   */
  validateOffline(): ValidationResponse {
    const license = this.loadLicense();

    if (!license) {
      return { success: false, error: "NO_LICENSE" };
    }

    const hardwareId = this.getHardwareId();

    // Check hardware ID Match
    if (license.hardwareId !== hardwareId) {
      return { success: false, error: "HARDWARE_MISMATCH" };
    }

    // Check expiration
    if (license.expiresAt && new Date() > new Date(license.expiresAt)) {
      return { success: false, error: "LICENSE_EXPIRED" };
    }

    // Check grace period (Require online validation after grace period)
    // Grace period = 1 year
    const lastValidated = new Date(license.lastValidated);
    const daysSinceValidation =
      (Date.now() - lastValidated.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceValidation > CONFIG.GRACE_PERIOD_DAYS) {
      return { success: false, error: "GRACE_PERIOD_EXCEEDED" };
    }

    return { success: true, data: { valid: true } };
  }

  /**
   * Check if license needs online revalidation
   */
  needsRevalidation(): boolean {
    const license = this.loadLicense();

    if (!license) return false;

    const lastValidated = new Date(license.lastValidated);
    const daysSinceValidation =
      (Date.now() - lastValidated.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceValidation >= CONFIG.VALIDATION_INTERVAL_DAYS;
  }

  /**
   * Main method: Check if app is licensed
   * Call this on app startup
   */
  async checkLicense(): Promise<CheckLicense> {
    const license = this.loadLicense();

    // No license stored - needs activation
    if (!license) {
      return { licensed: false, error: "NO_LICENSE", needsActivation: true };
    }

    // Try online validation if needed
    if (this.needsRevalidation()) {
      const result = await this.validateOnline();
      return {
        licensed: result?.data?.valid,
        error: result?.error,
        needsActivation: result?.error === "HARDWARE_MISMATCH"
      };
    }

    // Use offline validation
    const result = this.validateOffline();
    return {
      licensed: result?.data?.valid,
      error: result?.error,
      needsActivation: !result?.data?.valid
    };
  }

  /**
   * Get current license info for display
   */
  getLicenseInfo(): GetLicenseInfo {
    const license = this.loadLicense();

    if (!license) {
      return { isLicensed: false };
    }

    return {
      isLicensed: true,
      serialKey: this.maskSerialKey(license.serialKey),
      expiresAt: license.expiresAt,
      activatedAt: license.activatedAt
    };
  }

  /**
   * Mask serial key for display (show only last segment)
   */
  private maskSerialKey(key: string): string {
    const segments = key.split("-");
    return segments
      .map((s, i) => (i === segments.length - 1 ? s : "****"))
      .join("-");
  }
}

// Export singleton instance
export const licenseManager = new LicenseManager();
