import { z } from "zod";
import {
  getBaseReturnSchema,
  getPaginatedSchema,
  queryParamsSchema
} from "./helpers";
import { selectProductSchema } from "./products.zod";
import { baseCashDrawerEventSchema, basePurchaseSchema } from "./shared.zod"; // Import from shared file

// Base Vendor Schema
export const baseVendorSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Base Purchase Item Schema
export const basePurchaseItemSchema = z.object({
  id: z.string(),
  purchaseId: z.string(),
  productId: z.string().nullable(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
  totalPrice: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Export base purchase schema for compatibility
export { basePurchaseSchema };

// Item Schemas for avoiding circular dependency errors
export const purchaseListItemSchema = basePurchaseSchema.extend({
  vendor: baseVendorSchema
    .pick({
      id: true,
      name: true
    })
    .optional(),
  totalItems: z.number().optional()
});

// Select Schemas (with relations)
export const selectVendorSchema = baseVendorSchema.extend({
  purchases: z.array(basePurchaseSchema).optional()
});

export const selectPurchaseItemSchema = basePurchaseItemSchema.extend({
  purchase: basePurchaseSchema.optional(),
  product: selectProductSchema.nullable().optional()
});

export const selectPurchaseSchema = basePurchaseSchema.extend({
  vendor: baseVendorSchema.optional(),
  purchaseItems: z.array(basePurchaseItemSchema).optional(),
  cashDrawerEvents: z.array(baseCashDrawerEventSchema).optional()
});

// Controllers Input / Response Schemas

// 1.1. Select all vendors controller -> input = queryParamsSchema
// 1.2. Select all vendors controller -> response
export const getAllVendorsResponseSchema = getBaseReturnSchema(
  getPaginatedSchema(z.array(baseVendorSchema))
);

export const getVenderByIdResponseSchema =
  getBaseReturnSchema(selectVendorSchema);

// 1.3. Insert vendor controller -> input
export const insertVendorSchema = baseVendorSchema.omit({
  createdAt: true,
  updatedAt: true,
  id: true
});

// 1.4. Insert vendor controller -> response
export const insertVendorResponseSchema = getBaseReturnSchema(baseVendorSchema);

// 1.5. Update vendor controller -> input
export const updateVendorSchema = insertVendorSchema.partial();

// 1.6. Update vendor controller -> response
export const updateVendorResponseSchema = getBaseReturnSchema(baseVendorSchema);

// 1.7. Delete vendor controller -> input = vendorId param
// 1.8. Delete vendor controller -> response = messageSchema

// 2.1 select all purchases controller -> input = queryParamsSchema + optional vendorId filter
export const getAllPurchasesQuerySchema = queryParamsSchema.extend({
  vendorId: z.string().optional()
});

// 2.2 select all purchases controller -> response
export const getAllPurchasesResponseSchema = getBaseReturnSchema(
  getPaginatedSchema(z.array(purchaseListItemSchema))
);

// 2.3 Select purchase by ID controller -> input = purchaseId param
// 2.4 Select purchase by ID controller -> response
export const getPurchaseByIdResponseSchema =
  getBaseReturnSchema(selectPurchaseSchema);

// 2.5 Create new purchase controller -> input
export const createPurchaseSchema = basePurchaseSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    id: true,
    totalAmount: true,
    dueAmount: true
  })
  .extend({
    totalAmount: z.number().min(0).optional(),
    dueAmount: z.number().min(0).optional()
  });

// 2.6 Create new purchase controller -> response
export const createPurchaseResponseSchema =
  getBaseReturnSchema(basePurchaseSchema);

// 2.7 Update purchase controller -> input
export const updatePurchaseSchema = createPurchaseSchema.partial();

// 2.8 Update purchase controller -> response
export const updatePurchaseResponseSchema =
  getBaseReturnSchema(basePurchaseSchema);

// 2.9 Delete purchase controller -> input = purchaseId param
// 2.10 Delete purchase controller -> response = messageSchema

// 3.1 Add purchase item controller -> input
export const addPurchaseItemSchema = basePurchaseItemSchema
  .omit({
    createdAt: true,
    updatedAt: true,
    id: true,
    totalPrice: true
  })
  .extend({
    totalPrice: z.number().min(0).optional() // Can be calculated on server
  });

// 3.2 Add purchase item controller -> response
export const addPurchaseItemResponseSchema = getBaseReturnSchema(
  basePurchaseItemSchema
);

// 3.3 Update purchase item controller -> input
export const updatePurchaseItemSchema = addPurchaseItemSchema.partial();

// 3.4 Update purchase item controller -> response
export const updatePurchaseItemResponseSchema = getBaseReturnSchema(
  basePurchaseItemSchema
);

// 3.5 Delete purchase item controller -> input = purchaseItemId param
// 3.6 Delete purchase item controller -> response = messageSchema

// 4.1 Update stock levels controller -> input = purchaseId param
// 4.2 Update stock levels controller -> response = messageSchema

// Enhanced update purchase schema with user tracking
export const updatePurchaseWithPaymentSchema = updatePurchaseSchema.extend({
  userId: z.string().optional(), // Required for payment tracking
  paymentDescription: z.string().optional() // Optional payment notes
});

// Response schema remains the same
export const updatePurchaseWithPaymentResponseSchema =
  updatePurchaseResponseSchema;

// 5.1 Get purchase payment history controller -> input = purchaseId
// 5.2 Get purchase payment history controller -> response = array of cashDrawerEventSchema
export const getPurchasePaymentHistoryResponseSchema = getBaseReturnSchema(
  z.array(baseCashDrawerEventSchema)
);

// ================ Types Definitions ================
export type SelectVendorSchema = z.infer<typeof selectVendorSchema>;
export type SelectPurchaseItemSchema = z.infer<typeof selectPurchaseItemSchema>;
export type SelectPurchaseSchema = z.infer<typeof selectPurchaseSchema>;

export type PurchaseListItemSchema = z.infer<typeof purchaseListItemSchema>;

export type GetAllVendorsResponseSchema = z.infer<
  typeof getAllVendorsResponseSchema
>;

export type GetVendorByIdResponseSchema = z.infer<
  typeof getVenderByIdResponseSchema
>;

export type InsertVendorSchema = z.infer<typeof insertVendorSchema>;
export type InsertVendorResponseSchema = z.infer<
  typeof insertVendorResponseSchema
>;

export type UpdateVendorSchema = z.infer<typeof updateVendorSchema>;
export type UpdateVendorResponseSchema = z.infer<
  typeof updateVendorResponseSchema
>;

export type GetAllPurchasesQuerySchema = z.infer<
  typeof getAllPurchasesQuerySchema
>;

export type GetAllPurchasesResponseSchema = z.infer<
  typeof getAllPurchasesResponseSchema
>;

export type GetPurchaseByIdResponseSchema = z.infer<
  typeof getPurchaseByIdResponseSchema
>;

export type CreatePurchaseSchema = z.infer<typeof createPurchaseSchema>;

export type CreatePurchaseResponseSchema = z.infer<
  typeof createPurchaseResponseSchema
>;

export type UpdatePurchaseSchema = z.infer<typeof updatePurchaseSchema>;

export type UpdatePurchaseResponseSchema = z.infer<
  typeof updatePurchaseResponseSchema
>;

export type AddPurchaseItemSchema = z.infer<typeof addPurchaseItemSchema>;
export type AddPurchaseItemResponseSchema = z.infer<
  typeof addPurchaseItemResponseSchema
>;

export type UpdatePurchaseItemSchema = z.infer<typeof updatePurchaseItemSchema>;
export type UpdatePurchaseItemResponseSchema = z.infer<
  typeof updatePurchaseItemResponseSchema
>;

export type UpdatePurchaseWithPaymentSchema = z.infer<
  typeof updatePurchaseWithPaymentSchema
>;

export type UpdatePurchaseWithPaymentResponseSchema = z.infer<
  typeof updatePurchaseWithPaymentResponseSchema
>;

export type GetPurchasePaymentHistoryResponseSchema = z.infer<
  typeof getPurchasePaymentHistoryResponseSchema
>;
