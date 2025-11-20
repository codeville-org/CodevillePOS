import { z } from "zod";

export const queryParamsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
  search: z.string().optional()
});

export type QueryParamsSchema = z.infer<typeof queryParamsSchema>;

export const productsQueryParamsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
  search: z.string().optional(),
  category: z.string().optional(),
  featured: z.boolean().optional()
});

export type ProductsQueryParamsSchema = z.infer<
  typeof productsQueryParamsSchema
>;

export const transactionsQueryParamsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  sort: z.enum(["asc", "desc"]).optional().default("desc"),
  search: z.string().optional(),
  customer: z.string().optional()
});

export type TransactionsQueryParamsSchema = z.infer<
  typeof transactionsQueryParamsSchema
>;

export function getBaseReturnSchema<T>(data: z.ZodType<T>) {
  return z.object({
    data: data.nullable(),
    success: z.boolean(),
    error: z.string().nullable()
  });
}

export function getPaginatedSchema<T>(data: z.ZodType<T>) {
  return z.object({
    data,
    meta: z.object({
      currentPage: z.number(),
      limit: z.number(),
      totalCount: z.number(),
      totalPages: z.number()
    })
  });
}

export const idParamSchema = z.object({
  id: z.string()
});

export type IdParam = z.infer<typeof idParamSchema>;

export const messageSchema = z.object({
  message: z.string()
});

export type MessageSchema = z.infer<typeof messageSchema>;

export const messageResponseSchema = getBaseReturnSchema(messageSchema);

export type MessageResponseT = z.infer<typeof messageResponseSchema>;
