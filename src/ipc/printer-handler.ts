import {
  getAvailablePrintersController,
  getPlatformController,
  openCashDrawerController,
  printImageBillController,
  printImageController,
  printImageLabelController,
  printReceiptController,
  savePrinterSettingsController,
  selectImageFileController,
  testPrinterController
} from "@/controllers/print.controller";
import { createHandler } from "./create-handler";

const handler = createHandler("print");

export const printerHandler = {
  register() {
    handler.handle("getAvailablePrinters", getAvailablePrintersController);
    handler.handle("getPlatform", getPlatformController);
    handler.handle("openCashDrawer", openCashDrawerController);
    handler.handle("printImage", printImageController);
    handler.handle("printImageBill", printImageBillController);
    handler.handle("printImageLabel", printImageLabelController);
    handler.handle("printReceipt", printReceiptController);
    handler.handle("savePrinterSettings", savePrinterSettingsController);
    handler.handle("testPrinter", testPrinterController);
    handler.handle("selectImageFile", selectImageFileController);
  }
};
