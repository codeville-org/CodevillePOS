import {
  createNewProductController,
  deleteProductController,
  exportProductsController,
  getAllProductsController,
  getProductByBarcodeController,
  getProductByIDController,
  importProductsController,
  selectImportFileController,
  updateProductController
} from "@/controllers/products.controller";
import { createHandler } from "./create-handler";

const handler = createHandler("products");

export const productsHandler = {
  register() {
    handler.handle("getAll", getAllProductsController);
    handler.handle("getById", getProductByIDController);
    handler.handle("getByBarcode", getProductByBarcodeController);
    handler.handle("create", createNewProductController);
    handler.handle("update", updateProductController);
    handler.handle("delete", deleteProductController);
    handler.handle("import", importProductsController);
    handler.handle("export", exportProductsController);
    handler.handle("selectImportFile", selectImportFileController);
  }
};
