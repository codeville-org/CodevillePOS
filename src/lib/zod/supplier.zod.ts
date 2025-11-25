import { z } from "zod";
import { baseCashDrawerEventSchema } from "./cashflow.zod";
import { getBaseReturnSchema, getPaginatedSchema } from "./helpers";
import { selectProductSchema } from "./products.zod";

// Base Schemas

// 1. Base Vendor Schema
export const baseVendorSchema = z.object({
  id: z.string(),

  name: z.string(),
  description: z.string().nullable(),

  createdAt: z.date(),
  updatedAt: z.date()
});

// 2. Base Purchase Schema
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

// 3. Base Purchase Item Schema
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

// Select Schemas (avoiding circular references)

// 1. Select Vendor Schema
export const selectVendorSchema = baseVendorSchema.extend({
  purchases: z.array(basePurchaseSchema).optional()
});

// 2. Select Purchase Item Schema
export const selectPurchaseItemSchema = basePurchaseItemSchema.extend({
  purchase: basePurchaseSchema.optional(),
  product: selectProductSchema.nullable().optional()
});

// 3. Select Purchase Schema
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
// 2.2 select all purchases controller -> response
export const getAllPurchasesResponseSchema = getBaseReturnSchema(
  getPaginatedSchema(z.array(basePurchaseSchema))
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

// ================ Types Definitions ================
export type SelectVendorSchema = z.infer<typeof selectVendorSchema>;
export type SelectPurchaseItemSchema = z.infer<typeof selectPurchaseItemSchema>;
export type SelectPurchaseSchema = z.infer<typeof selectPurchaseSchema>;

export type GetAllVendorsResponseSchema = z.infer<
  typeof getAllVendorsResponseSchema
>;

export type InsertVendorSchema = z.infer<typeof insertVendorSchema>;
export type InsertVendorResponseSchema = z.infer<
  typeof insertVendorResponseSchema
>;

export type UpdateVendorSchema = z.infer<typeof updateVendorSchema>;
export type UpdateVendorResponseSchema = z.infer<
  typeof updateVendorResponseSchema
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
