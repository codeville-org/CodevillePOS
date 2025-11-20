import { and, desc, eq, sql } from "drizzle-orm";

import { getDB } from "@/database";
import { users } from "@/database/schema";
import { MessageResponseT, QueryParamsSchema } from "@/lib/zod/helpers";
import {
  CreateUserResponseT,
  GetAllUsersResponseT,
  GetUserResponseT,
  InsertUserSchema,
  UpdateUserResponseT,
  UpdateUserSchema
} from "@/lib/zod/user.zod";
import { encrypt } from "@/shared/utils/auth-util";

// ====== Get All Users Controller ======
export async function getAllUsersController(
  query: QueryParamsSchema
): Promise<GetAllUsersResponseT> {
  try {
    const { limit, page, search, sort } = query;
    const db = getDB();

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // Cap at 100 items
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const whereConditions = [];

    if (search) {
      whereConditions.push(
        sql`LOWER(${users.email}) LIKE LOWER(${`%${search}%`})`,
        sql`LOWER(${users.username}) LIKE LOWER(${`%${search}%`})`
      );
    }

    // Build the query
    const usersQuery = db
      .select()
      .from(users)
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .orderBy(
        sort.toLowerCase() === "asc" ? users.createdAt : desc(users.createdAt)
      )
      .limit(limitNum)
      .offset(offset);

    // Get total count for pagination metadata
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereConditions.length ? and(...whereConditions) : undefined);

    const [userEntries, _totalCount] = await Promise.all([
      usersQuery,
      totalCountQuery
    ]);

    const totalCount = _totalCount[0]?.count || 0;

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);

    return {
      data: {
        data: userEntries,
        meta: {
          currentPage: pageNum,
          limit: limitNum,
          totalCount,
          totalPages
        }
      },
      success: true,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as Error).message || "An error occurred while fetching users."
    };
  }
}

// ====== Get User by ID Controller ======
export async function getUserByIdController(
  userId: string
): Promise<GetUserResponseT> {
  try {
    const db = getDB();

    const user = await db.query.users.findFirst({
      where: (fields, { eq }) => {
        return eq(fields.id, userId);
      }
    });

    if (!user) throw new Error("User not found");

    return {
      success: true,
      error: null,
      data: user
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as Error).message || "An error occurred while fetching the user."
    };
  }
}

// ===== Create new user controller ======
export async function createUserController(
  body: InsertUserSchema
): Promise<CreateUserResponseT> {
  try {
    const db = getDB();

    // Encrypt password before storing
    const encryptedPassword = encrypt(body.password);

    const [inserted] = await db
      .insert(users)
      .values({
        username: body.username,
        email: body.email,
        password: encryptedPassword,
        isAdmin: body.isAdmin
      })
      .returning();

    return {
      data: inserted,
      success: true
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as Error).message || "An error occurred while creating the user."
    };
  }
}

// ===== Update User by ID Controller ======
export async function updateUserByIdController(
  id: string,
  values: UpdateUserSchema
): Promise<UpdateUserResponseT> {
  try {
    const db = getDB();

    const [updated] = await db
      .update(users)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    if (!updated) throw new Error("Failed to update user");

    return {
      data: updated,
      success: true,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as Error).message || "An error occurred while updating the user."
    };
  }
}

// ===== Delete User by ID Controller ======
export async function deleteUserByIdController(
  userId: string
): Promise<MessageResponseT> {
  try {
    const db = getDB();

    const deleteResult = await db
      .delete(users)
      .where(eq(users.id, userId))
      .returning();

    if (deleteResult.length === 0) {
      throw new Error("User not found or already deleted");
    }

    return {
      data: { message: "User deleted successfully" },
      success: true,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as Error).message || "An error occurred while deleting the user."
    };
  }
}
