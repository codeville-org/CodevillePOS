import { z } from "zod";

import { selectCategorySchema } from "./categories.zod";
import {
  getBaseReturnSchema,
  getPaginatedSchema,
  messageSchema
} from "./helpers";

// Product Base Schema -> Without Relations
const baseProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  barcode: z.string(),
  discountedPrice: z.number(),
  stockQuantity: z.number(),
  unitPrice: z.number(),
  unitAmount: z.number(),
  unit: z.string(),
  description: z.string(),
  imageFilename: z.string(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
});

// Product Select with Category Schema
export const selectProductSchema = baseProductSchema.extend({
  category: selectCategorySchema
});

export type SelectProductSchema = z.infer<typeof selectProductSchema>;

// Insert Product Schema
export const insertProductSchema = baseProductSchema
  .extend({
    categoryId: z.string()
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  });

export type InsertProductSchema = z.infer<typeof insertProductSchema>;

// Update Product Schema
export const updateProductSchema = baseProductSchema
  .extend({
    categoryId: z.string()
  })
  .omit({
    id: true,
    createdAt: true
  })
  .partial();

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;

// Ent-to-end functionalities Return schemas/Types
export const getAllProductsResponseSchema = getBaseReturnSchema(
  getPaginatedSchema(z.array(selectProductSchema))
);

export type GetAllProductsResponse = z.infer<
  typeof getAllProductsResponseSchema
>;

export const getProductByIdResponseSchema =
  getBaseReturnSchema(selectProductSchema);

export type GetProductByIDResponse = z.infer<
  typeof getProductByIdResponseSchema
>;

export const getProductByBarcodeResponseSchema =
  getBaseReturnSchema(selectProductSchema);

export type GetProductByBarcodeResponse = z.infer<
  typeof getProductByBarcodeResponseSchema
>;

export const createProductResponseSchema =
  getBaseReturnSchema(selectProductSchema);

export type CreateProductResponse = z.infer<typeof createProductResponseSchema>;

export const updateProductResponseSchem =
  getBaseReturnSchema(selectProductSchema);

export type UpdateProductResponse = z.infer<typeof updateProductResponseSchem>;

export const deleteProductResponseSchema = getBaseReturnSchema(messageSchema);

export type DeleteProductResponse = z.infer<typeof deleteProductResponseSchema>;

// Import and Export Features
export const selectImportFileSchema = z.object({
  success: z.boolean(),
  filePath: z.string().optional(),
  error: z.string().optional()
});

export type SelectImportFileType = z.infer<typeof selectImportFileSchema>;

export const importProductsSchema = z.object({
  filePath: z.string()
});

export type ImportProductsSchema = z.infer<typeof importProductsSchema>;

export const importProductsResponse = getBaseReturnSchema(z.object({}));

export type ImportProductsResponse = z.infer<typeof importProductsResponse>;

export const exportProductsResponse = getBaseReturnSchema(z.object({}));

export type ExportProductsResponse = z.infer<typeof exportProductsResponse>;

const generateBarcodeResponseSchema = getBaseReturnSchema(
  z.object({
    barcode: z.string()
  })
);

export type GenerateBarcodeResponse = z.infer<
  typeof generateBarcodeResponseSchema
>;
