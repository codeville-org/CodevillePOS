import {
  createUserController,
  deleteUserByIdController,
  getAllUsersController,
  getUserByIdController,
  updateUserByIdController
} from "@/controllers/user.controller";
import { createHandler } from "./create-handler";

const handler = createHandler("user");

export const userHandler = {
  register() {
    handler.handle("getAll", getAllUsersController);
    handler.handle("get", getUserByIdController);
    handler.handle("create", createUserController);
    handler.handle("update", updateUserByIdController);
    handler.handle("delete", deleteUserByIdController);
  }
};
