import {
  endShiftController,
  getActiveShiftController,
  getCashDrawerBalanceController,
  initializeCashDrawerBalanceController,
  startShiftController,
  updateCashDrawerBalanceController
} from "@/controllers/cashdrawer.controller";
import { createHandler } from "./create-handler";

const handler = createHandler("cashflow");

export const cashdrawerHandler = {
  register() {
    handler.handle("initializeBalance", initializeCashDrawerBalanceController);
    handler.handle("getBalance", getCashDrawerBalanceController);
    handler.handle("updateBalance", updateCashDrawerBalanceController);
    handler.handle("startShift", startShiftController);
    handler.handle("getActiveShift", getActiveShiftController);
    handler.handle("endShift", endShiftController);
  }
};
