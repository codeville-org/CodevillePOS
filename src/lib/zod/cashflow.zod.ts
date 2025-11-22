import { z } from "zod";

import { getBaseReturnSchema } from "./helpers";
import { selectTransactionSchema } from "./transactions.zod";
import { baseUserSchema } from "./user.zod";

export const cashDrawerEventTypeSchema = z.enum([
  "opening_balance", // Morning cash count
  "cash_in", // Cash received from customer
  "cash_out", // Change given to customer
  "manual_add", // Admin manually adds cash
  "manual_remove", // Admin manually removes cash
  "shift_end", // End of shift reconciliation
  "correction" // Balance correction
]);

export type cashDrawerEventType = z.infer<typeof cashDrawerEventTypeSchema>;

export const denominationsSchema = z.object({
  notes_5000: z.number().int().nonnegative().default(0),
  notes_2000: z.number().int().nonnegative().default(0),
  notes_1000: z.number().int().nonnegative().default(0),
  notes_500: z.number().int().nonnegative().default(0),
  notes_100: z.number().int().nonnegative().default(0),
  notes_50: z.number().int().nonnegative().default(0),
  notes_20: z.number().int().nonnegative().default(0),

  coins_10: z.number().int().nonnegative().default(0),
  coins_5: z.number().int().nonnegative().default(0),
  coins_2: z.number().int().nonnegative().default(0),
  coins_1: z.number().int().nonnegative().default(0)
});

export type Denominations = z.infer<typeof denominationsSchema>;

const baseCashDrawerEventSchema = z.object({
  id: z.string(),

  eventType: cashDrawerEventTypeSchema,

  totalAmount: z.number(),

  ...denominationsSchema.shape,

  transactionId: z.string().nullable(),
  transaction: selectTransactionSchema.optional(),

  userId: z.string(),
  user: baseUserSchema.optional(),

  description: z.string().nullable(),
  previousBalance: z.number().nullable(),
  newBalance: z.number().nullable(),

  createdAt: z.date(),
  updatedAt: z.date()
});

const baseCashDrawerBalanceSchema = z.object({
  id: z.string(),

  ...denominationsSchema.shape,

  totalAmount: z.number().nonnegative(),

  isActive: z.boolean().default(true),

  lastEventId: z.string().nullable(),
  lastEvent: baseCashDrawerEventSchema.optional(),

  lastUpdatedBy: z.string(),
  lastUpdatedByUser: baseUserSchema.optional(),

  createdAt: z.date(),
  updatedAt: z.date()
});

// Foundmental Schemas
// --- Events Schemas
export const selectCashDrawerEventSchema = baseCashDrawerEventSchema;

export type SelectCashDrawerEvent = z.infer<typeof selectCashDrawerEventSchema>;

// --- Balance Schemas
export const selectCashDrawerBalanceSchema = baseCashDrawerBalanceSchema;

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

// Intitialize Cash Drawer Balance Controller - Return
export const initializeCashDrawerBalanceResponseSchema = getBaseReturnSchema(
  selectCashDrawerBalanceSchema
);

export type InitializeCashDrawerBalanceResponse = z.infer<
  typeof initializeCashDrawerBalanceResponseSchema
>;

// Get Cash Drawer Balance Controller - Return
export const getCashDrawerBalanceResponseSchema = getBaseReturnSchema(
  selectCashDrawerBalanceSchema
);

export type GetCashDrawerBalanceResponse = z.infer<
  typeof getCashDrawerBalanceResponseSchema
>;

// Update Cash Drawer Balance Controller - Return
export const updateCashDrawerBalanceResponseSchema = getBaseReturnSchema(
  updateCashDrawerBalanceSchema
);

export type UpdateCashDrawerBalanceResponse = z.infer<
  typeof updateCashDrawerBalanceResponseSchema
>;
