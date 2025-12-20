import { BrowserWindow } from "electron";

import { licenseHandler } from "./license-handler";

export function setupActivationIPCHandlers(window: BrowserWindow) {
  // License management
  licenseHandler.register(window);
}
