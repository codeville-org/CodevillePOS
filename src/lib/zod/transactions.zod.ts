import z from "zod";
import { selectCustomerSchema } from "./customers.zod";
import {
  getBaseReturnSchema,
  getPaginatedSchema,
  messageSchema
} from "./helpers";

export enum PaymentMethod {
  CASH = "cash",
  CARD = "card",
  LEND = "lend"
}

export enum PaymentStatus {
  CANCELLED = "cancelled",
  COMPLETED = "completed",
  PENDING = "pending"
}

export const baseTransactionSchema = z.object({
  id: z.string(),
  transactionNumber: z.string(),
  customerId: z.string(),
  subtotalAmount: z.number().min(0),
  discountAmount: z.number().min(0),
  taxAmount: z.number().min(0),
  totalAmount: z.number().min(0),
  paymentMethod: z.nativeEnum(PaymentMethod),
  cashReceived: z.number(),
  changeGiven: z.number(),
  status: z.nativeEnum(PaymentStatus),
  notes: z.string(),
  receiptPrinted: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type BaseTransactionSchema = z.infer<typeof baseTransactionSchema>;

export const baseTransactionItemSchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  productId: z.string(),
  productName: z.string(),
  productBarcode: z.string(),
  unitPrice: z.number(),
  ourPrice: z.number(),
  unitAmount: z.number(),
  unit: z.string(),
  quantity: z.number(),
  totalAmount: z.number(),
  discountAmount: z.number(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export type BaseTransactionItemSchema = z.infer<
  typeof baseTransactionItemSchema
>;

const uninitializedTransactionItem = baseTransactionItemSchema.omit({
  id: true,
  transactionId: true,
  createdAt: true,
  updatedAt: true
});

export type UninitializedTransactionItem = z.infer<
  typeof uninitializedTransactionItem
>;

// Select Transaction with items and customer
export const selectTransactionSchema = baseTransactionSchema.extend({
  customer: selectCustomerSchema.optional(),
  items: z.array(baseTransactionItemSchema)
});

export type SelectTransactionSchema = z.infer<typeof selectTransactionSchema>;

// Insert Transaction
export const createTransactionSchema = baseTransactionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type CreateTransactionSchema = z.infer<typeof createTransactionSchema>;

// Update Transaction
export const updateTransactionSchema = baseTransactionSchema.partial();

export type UpdateTransactionSchema = z.infer<typeof updateTransactionSchema>;

// End-to-End Schemas
export const getAllTransactionsResponseSchema = getBaseReturnSchema(
  getPaginatedSchema(z.array(selectTransactionSchema))
);

export type GetAllTransactionsResponse = z.infer<
  typeof getAllTransactionsResponseSchema
>;

export const getTransactionResponseSchema = getBaseReturnSchema(
  selectTransactionSchema
);

export type GetTransactionResponse = z.infer<
  typeof getTransactionResponseSchema
>;

export const initializeTransactionResponseSchema = getBaseReturnSchema(
  baseTransactionItemSchema
);

export type InitializeTransactionResponse = z.infer<
  typeof initializeTransactionResponseSchema
>;

export const updateTransactionResponseSchema = getBaseReturnSchema(
  baseTransactionItemSchema
);

export type UpdateTransactionResponse = z.infer<
  typeof updateTransactionResponseSchema
>;

export const addNewTransactionItemsResponseSchema = getBaseReturnSchema(
  z.array(baseTransactionItemSchema)
);

export type AddNewTransactionItemsResponse = z.infer<
  typeof addNewTransactionItemsResponseSchema
>;

export const deleteTransactionSchema = getBaseReturnSchema(messageSchema);

export type DeleteTransactionResponse = z.infer<typeof deleteTransactionSchema>;
