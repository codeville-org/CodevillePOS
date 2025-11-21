import { z } from "zod";
import { getBaseReturnSchema } from "./helpers";
import { PaymentMethod } from "./transactions.zod";

export const storeSettingsSchema = z.object({
  storeLogo: z.string().optional(),
  storeName: z.string().optional(),
  address: z.string().optional(),
  contactPhone: z.string().optional()
});

export type StoreSettingsT = z.infer<typeof storeSettingsSchema>;

// Key-Value Mapper for App Settings
export const appSettingsMap = z.object({
  defaultPrinter: z.string().optional(),

  availablePaymentMethods: z.array(z.nativeEnum(PaymentMethod)).optional(),

  imagesEnabled: z.boolean().default(true).optional(),

  // Store Settings
  ...storeSettingsSchema.shape
});

export const resetSystemResponseSchema = z.object({
  message: z.string().optional()
});

export const appSettingsMapInsert = appSettingsMap.partial();

export type AppSettingsMapT = z.infer<typeof appSettingsMap>;

export type AppSettingsMapInsertT = z.infer<typeof appSettingsMapInsert>;

// End-to-end Schema
export const getAppSettingsResponse = getBaseReturnSchema(appSettingsMap);

export type GetAppSettingsResponseT = z.infer<typeof getAppSettingsResponse>;

export const resetSystemResponse = getBaseReturnSchema(
  resetSystemResponseSchema
);

export type ResetSystemResponseT = z.infer<typeof resetSystemResponse>;
