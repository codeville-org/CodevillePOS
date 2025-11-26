import {
  addPurchaseItemController,
  createPurchaseController,
  deletePurchaseController,
  deletePurchaseItemController,
  getAllPurchasesController,
  getPurchaseByIdController,
  getPurchasePaymentHistory,
  updatePurchaseController,
  updatePurchaseItemController,
  updateStockLevelsController
} from "@/controllers/purchase.controller";
import { createHandler } from "./create-handler";

const handler = createHandler("purchase");

export const purchaseHandler = {
  register() {
    handler.handle("getAll", getAllPurchasesController);
    handler.handle("create", createPurchaseController);
    handler.handle("getById", getPurchaseByIdController);
    handler.handle("update", updatePurchaseController);
    handler.handle("delete", deletePurchaseController);
    handler.handle("addItem", addPurchaseItemController);
    handler.handle("updateItem", updatePurchaseItemController);
    handler.handle("deleteItem", deletePurchaseItemController);
    handler.handle("updateStock", updateStockLevelsController);
    handler.handle("history", getPurchasePaymentHistory);
  }
};
