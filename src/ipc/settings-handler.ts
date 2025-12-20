import {
  getAppSettingsController,
  resetSystemController,
  upsertAppSettingsController
} from "@/controllers/settings.controller";
import { createHandler } from "./create-handler";

const handler = createHandler("settings");

export const appSettingsHandler = {
  register() {
    handler.handle("get", getAppSettingsController);
    handler.handle("upsert", upsertAppSettingsController);
    handler.handle("reset", resetSystemController);
  }
};
