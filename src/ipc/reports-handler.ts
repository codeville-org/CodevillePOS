import { getDashboardAnalyticsController } from "@/controllers/reports.controller";
import { createHandler } from "./create-handler";

const handler = createHandler("reports");

export const reportsHandler = {
  register() {
    handler.handle("getAnalytics", getDashboardAnalyticsController);
  }
};
