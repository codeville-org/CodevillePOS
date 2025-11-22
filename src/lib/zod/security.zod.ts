import { z } from "zod";
import { getBaseReturnSchema } from "./helpers";
import { baseUserSchema } from "./user.zod";

// Key-Value Mapper for App Settings
export const securitySchema = z.object({
  // Security Settings
  message: z.string().optional(),
  user: baseUserSchema.optional()
});

// End-to-end Schema
export const securityResponseSchema = getBaseReturnSchema(securitySchema);

export type GetSecurityResponseT = z.infer<typeof securityResponseSchema>;
