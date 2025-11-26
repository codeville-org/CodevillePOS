import {
  createVendorController,
  deleteVendorController,
  getAllVendorsController,
  getVendorByIdController,
  updateVendorController
} from "@/controllers/vendor.controller";
import { createHandler } from "./create-handler";

const handler = createHandler("vendor");

export const vendorHandler = {
  register() {
    handler.handle("getAll", getAllVendorsController);
    handler.handle("getById", getVendorByIdController);
    handler.handle("create", createVendorController);
    handler.handle("update", updateVendorController);
    handler.handle("delete", deleteVendorController);
  }
};
