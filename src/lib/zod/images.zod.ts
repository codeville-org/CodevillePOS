import { z } from "zod";

// ================= Select Image Directory Schema =================
export const selectImageDirectoryResponseSchema = z.object({
  success: z.boolean(),
  directoryPath: z.string().optional(),
  error: z.string().optional()
});

export type SelectImageDirectoryResponse = z.infer<
  typeof selectImageDirectoryResponseSchema
>;

// ================= List Images in Directory Schema =================
export const listImagesInDirectoryResponseSchema = z.object({
  success: z.boolean(),
  images: z.array(z.string()).optional(),
  error: z.string().optional()
});

export type ListImagesInDirectoryResponse = z.infer<
  typeof listImagesInDirectoryResponseSchema
>;

// ================= Copy Images from Directory Schema =================
export const copyImagesFromDirectoryResponseSchema = z.object({
  success: z.boolean(),
  copiedCount: z.number().optional(),
  error: z.string().optional()
});

export type CopyImagesFromDirectoryResponse = z.infer<
  typeof copyImagesFromDirectoryResponseSchema
>;
