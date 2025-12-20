import {
  createCashDrawerEventController,
  endShiftController,
  getActiveShiftController,
  getAllShiftsController,
  getCashDrawerBalanceController,
  getShiftEventsController,
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
    handler.handle("createEvent", createCashDrawerEventController);
    handler.handle("getAllShifts", getAllShiftsController);
    handler.handle("getShiftEvents", getShiftEventsController);
  }
};
