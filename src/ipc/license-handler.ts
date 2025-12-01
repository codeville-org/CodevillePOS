import { BrowserWindow, ipcMain } from "electron";
import { licenseManager } from "../lib/license/client";

export const licenseHandler = {
  register(): void {
    // License activation handler
    ipcMain.handle("license:activate", async (event, serialKey: string) => {
      try {
        const result = await licenseManager.activate(serialKey);

        if (result.success) {
          // Close activation window
          const activationWindow = BrowserWindow.fromWebContents(event.sender);
          if (activationWindow) {
            activationWindow.close();
          }

          // Import createWindow dynamically to avoid circular dependency
          setTimeout(async () => {
            try {
              const { createWindow } = await import("../index");
              await createWindow();
            } catch (error) {
              console.error(
                "Failed to create main window after activation:",
                error
              );
            }
          }, 100);
        }

        return result;
      } catch (error) {
        console.error("License activation error:", error);
        return { success: false, error: "ACTIVATION_FAILED" };
      }
    });

    // Get hardware ID handler
    ipcMain.handle("license:getHardwareId", () => {
      try {
        return licenseManager.getHardwareId();
      } catch (error) {
        console.error("Failed to get hardware ID:", error);
        return "ERROR_GETTING_HARDWARE_ID";
      }
    });

    // Get license info handler
    ipcMain.handle("license:getInfo", () => {
      try {
        return licenseManager.getLicenseInfo();
      } catch (error) {
        console.error("Failed to get license info:", error);
        return { isLicensed: false };
      }
    });

    // Check license status handler
    ipcMain.handle("license:checkStatus", async () => {
      try {
        return await licenseManager.checkLicense();
      } catch (error) {
        console.error("Failed to check license:", error);
        return { licensed: false, error: "CHECK_FAILED" };
      }
    });

    // Validate license handler
    ipcMain.handle("license:validate", async () => {
      try {
        return await licenseManager.validateOnline();
      } catch (error) {
        console.error("Failed to validate license:", error);
        return { success: false, error: "VALIDATION_FAILED" };
      }
    });

    // Clear license handler (for troubleshooting)
    ipcMain.handle("license:clear", () => {
      try {
        licenseManager.clearLicense();
        return { success: true };
      } catch (error) {
        console.error("Failed to clear license:", error);
        return { success: false, error: "CLEAR_FAILED" };
      }
    });

    console.log("License IPC handlers registered");
  }
};
