import { z } from "zod";
import {
  getBaseReturnSchema,
  getPaginatedSchema,
  queryParamsSchema
} from "./helpers";
import {
  baseCashDrawerEventSchema,
  basePurchaseSchema,
  baseUserSchema,
  cashDrawerEventTypeSchema,
  denominationsSchema,
  type CashDrawerEventType,
  type Denominations
} from "./shared.zod";
import { selectTransactionSchema } from "./transactions.zod";

// Export the imported types and schemas for backward compatibility
export {
  cashDrawerEventTypeSchema,
  denominationsSchema,
  type CashDrawerEventType,
  type Denominations
};

// Enhanced Cash Drawer Event Schema with relations
export const selectCashDrawerEventSchema = baseCashDrawerEventSchema.extend({
  transaction: selectTransactionSchema.optional(),
  purchase: basePurchaseSchema.optional(), // Fixed: changed from supplierPurchase to purchase
  user: baseUserSchema.optional()
});

export type SelectCashDrawerEvent = z.infer<typeof selectCashDrawerEventSchema>;

export const insertCashDrawerEventSchema = baseCashDrawerEventSchema.omit({
  createdAt: true,
  id: true,
  updatedAt: true
});

export type InsertCashDrawerEvent = z.infer<typeof insertCashDrawerEventSchema>;

// Balance Schema
const baseCashDrawerBalanceSchema = z.object({
  id: z.string(),
  ...denominationsSchema.shape,
  totalAmount: z.number().nonnegative(),
  isActive: z.boolean().default(true),
  lastEventId: z.string().nullable(),
  lastUpdatedBy: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const selectCashDrawerBalanceSchema = baseCashDrawerBalanceSchema.extend(
  {
    lastEvent: selectCashDrawerEventSchema.optional(), // Use selectCashDrawerEventSchema with relations
    lastUpdatedByUser: baseUserSchema.optional()
  }
);

export type SelectCashDrawerBalance = z.infer<
  typeof selectCashDrawerBalanceSchema
>;

export const insertCashDrawerBalanceSchema = baseCashDrawerBalanceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertCashDrawerBalance = z.infer<
  typeof insertCashDrawerBalanceSchema
>;

export const updateCashDrawerBalanceSchema =
  insertCashDrawerBalanceSchema.partial();

export type UpdateCashDrawerBalance = z.infer<
  typeof updateCashDrawerBalanceSchema
>;

// Shift Schema - FIXED to include user relation
const baseShiftSchema = z.object({
  id: z.string(),
  startedAt: z.date(),
  endedAt: z.date().nullable(),
  eventId: z.string(), // Added missing eventId field
  createdAt: z.date(),
  updatedAt: z.date()
});

// ✅ FIXED: Use selectCashDrawerEventSchema with user relation
export const selectShiftSchema = baseShiftSchema.extend({
  event: selectCashDrawerEventSchema.optional() // This now includes the user relation
});

export type SelectShift = z.infer<typeof selectShiftSchema>;

// Rest of your controller schemas...
export const initializeCashDrawerBalanceResponseSchema = getBaseReturnSchema(
  selectCashDrawerBalanceSchema
);

export type InitializeCashDrawerBalanceResponse = z.infer<
  typeof initializeCashDrawerBalanceResponseSchema
>;

export const getCashDrawerBalanceResponseSchema = getBaseReturnSchema(
  selectCashDrawerBalanceSchema
);

export type GetCashDrawerBalanceResponse = z.infer<
  typeof getCashDrawerBalanceResponseSchema
>;

export const updateCashDrawerBalanceResponseSchema = getBaseReturnSchema(
  updateCashDrawerBalanceSchema
);

export type UpdateCashDrawerBalanceResponse = z.infer<
  typeof updateCashDrawerBalanceResponseSchema
>;

export const startShiftControllerResponseSchema =
  getBaseReturnSchema(selectShiftSchema);

export type StartShiftControllerResponse = z.infer<
  typeof startShiftControllerResponseSchema
>;

export const getActiveShiftResponseSchema =
  getBaseReturnSchema(selectShiftSchema);

export type GetActiveShiftResponse = z.infer<
  typeof getActiveShiftResponseSchema
>;

export const endShiftControllerResponseSchema =
  getBaseReturnSchema(selectShiftSchema);

export type EndShiftControllerResponse = z.infer<
  typeof endShiftControllerResponseSchema
>;

export const insertCashDrawerEventResponseSchema = getBaseReturnSchema(
  selectCashDrawerEventSchema
);

export type InsertCashDrawerEventResponse = z.infer<
  typeof insertCashDrawerEventResponseSchema
>;

export const getAllShiftsInputSchema = queryParamsSchema;

export type GetAllShiftsInput = z.infer<typeof getAllShiftsInputSchema>;

export const getAllShiftsResponseSchema = getBaseReturnSchema(
  getPaginatedSchema(z.array(selectShiftSchema))
);

export type GetAllShiftsResponse = z.infer<typeof getAllShiftsResponseSchema>;

export const getShiftEventsInputSchema = z.object({
  startedAt: z.date(),
  endedAt: z.date().nullable().optional()
});

export type GetShiftEventsInput = z.infer<typeof getShiftEventsInputSchema>;

export const getShiftEventsResponseSchema = getBaseReturnSchema(
  z.array(selectCashDrawerEventSchema)
);

export type GetShiftEventsResponse = z.infer<
  typeof getShiftEventsResponseSchema
>;
