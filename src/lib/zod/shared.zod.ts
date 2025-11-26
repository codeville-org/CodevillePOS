import { z } from "zod";

// Base User Schema (needed for relations)
export const baseUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  email: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Base Purchase Schema (no relations)
export const basePurchaseSchema = z.object({
  id: z.string(),
  vendorId: z.string(),
  purchaseDescription: z.string().nullable(),
  totalAmount: z.number(),
  paidAmount: z.number(),
  dueAmount: z.number(),
  status: z.enum(["active", "completed"]).default("active"),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Denominations Schema
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

export const cashDrawerEventTypeSchema = z.enum([
  "opening_balance",
  "cash_in",
  "cash_out",
  "manual_add",
  "manual_remove",
  "shift_end",
  "correction"
]);

// Base Cash Drawer Event Schema (no relations)
export const baseCashDrawerEventSchema = z.object({
  id: z.string(),
  eventType: cashDrawerEventTypeSchema,
  totalAmount: z.number(),
  balanceId: z.string(), // Added missing balanceId
  ...denominationsSchema.shape,
  transactionId: z.string().nullable(),
  purchaseId: z.string().nullable(), // Changed from supplierPurchaseId to match your controller
  userId: z.string(),
  description: z.string().nullable(),
  previousBalance: z.number().nullable(),
  newBalance: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type Denominations = z.infer<typeof denominationsSchema>;
export type CashDrawerEventType = z.infer<typeof cashDrawerEventTypeSchema>;
export type BaseUser = z.infer<typeof baseUserSchema>;
export type BaseCashDrawerEvent = z.infer<typeof baseCashDrawerEventSchema>;
