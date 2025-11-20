import { z } from "zod";
import { getBaseReturnSchema, getPaginatedSchema } from "./helpers";

export const baseUserSchema = z.object({
  id: z.string(),

  // Username cannot contain spaces and special characters
  username: z
    .string()
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username must not contain spaces or special characters"
    ),

  email: z.string().email().optional(),
  password: z.string(),
  isAdmin: z.boolean().default(false),

  createdAt: z.date(),
  updatedAt: z.date()
});

export const insertUserSchema = baseUserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type InsertUserSchema = z.infer<typeof insertUserSchema>;

export const updateUserSchema = baseUserSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  })
  .partial();

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;

// End-to-end Schema
export const getAllUsersResponseSchema = getBaseReturnSchema(
  getPaginatedSchema(z.array(baseUserSchema))
);

export type GetAllUsersResponseT = z.infer<typeof getAllUsersResponseSchema>;

export const getUserResponseSchema = getBaseReturnSchema(baseUserSchema);

export type GetUserResponseT = z.infer<typeof getUserResponseSchema>;

export const createUserResponseSchema = getBaseReturnSchema(baseUserSchema);

export type CreateUserResponseT = z.infer<typeof createUserResponseSchema>;

export const updateUserResponseSchema = getBaseReturnSchema(baseUserSchema);

export type UpdateUserResponseT = z.infer<typeof updateUserResponseSchema>;
