import { BrowserWindow } from "electron";

import { cashdrawerHandler } from "./cashflow-handler";
import { categoriesHandler } from "./categories-handler";
import { customersHandler } from "./customers-handler";
import { imagesHandler } from "./images-handler";
import { printerHandler } from "./printer-handler";
import { productsHandler } from "./products-handler";
import { reportsHandler } from "./reports-handler";
import { securityHandler } from "./security-handler";
import { appSettingsHandler } from "./settings-handler";
import { transactionsHandler } from "./transactions-handler";
import { userHandler } from "./user-handler";
import { vendorHandler } from "./vendor-handler";
import { windowHandlers } from "./window-handler";

export function setupIPCHandlers(mainWindow: BrowserWindow) {
  // Window management
  windowHandlers.register(mainWindow);
  categoriesHandler.register();
  productsHandler.register();
  imagesHandler.register();
  customersHandler.register();
  transactionsHandler.register();
  appSettingsHandler.register();
  securityHandler.register();
  printerHandler.register();
  reportsHandler.register();
  userHandler.register();
  cashdrawerHandler.register();
  vendorHandler.register();
}
