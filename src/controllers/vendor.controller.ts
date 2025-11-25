import { getDB } from "@/database";
import { vendors } from "@/database/schema";
import { MessageResponseT, QueryParamsSchema } from "@/lib/zod/helpers";
import {
  GetAllVendorsResponseSchema,
  InsertVendorResponseSchema,
  InsertVendorSchema,
  UpdateVendorResponseSchema,
  UpdateVendorSchema
} from "@/lib/zod/supplier.zod";
import { and, desc, eq, sql } from "drizzle-orm";

// 1. Select all vendors controller
export async function getAllVendorsController(
  query: QueryParamsSchema
): Promise<GetAllVendorsResponseSchema> {
  try {
    const db = getDB();

    const { search, page, limit, sort } = query;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // Cap at 100 items
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const whereConditions = [];
    if (search) {
      whereConditions.push(
        sql`LOWER(${vendors.name}) LIKE LOWER(${`%${search}%`})`
      );
    }

    // Build the query
    const vendorsQuery = db
      .select()
      .from(vendors)
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .orderBy(
        sort.toLowerCase() === "asc"
          ? vendors.createdAt
          : desc(vendors.createdAt)
      )
      .limit(limitNum)
      .offset(offset);

    // Get total count for pagination metadata
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(vendors)
      .where(whereConditions.length ? and(...whereConditions) : undefined);

    const [vendorEntries, _totalCount] = await Promise.all([
      vendorsQuery,
      totalCountQuery
    ]);

    const totalCount = _totalCount[0]?.count || 0;

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);

    return {
      data: {
        data: vendorEntries,
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
      error: (error as Error).message || "Failed to fetch vendors",
      success: false
    };
  }
}

// Create vendor controller
export async function createVendorController(
  input: InsertVendorSchema
): Promise<InsertVendorResponseSchema> {
  try {
    const db = getDB();

    const [newVendor] = await db
      .insert(vendors)
      .values({ name: input.name, description: input.description })
      .returning();

    return {
      data: newVendor,
      success: true
    };
  } catch (error) {
    return {
      error: (error as Error).message || "Failed to create vendor",
      success: false
    };
  }
}

// Update vendor controller
export async function updateVendorController(
  input: UpdateVendorSchema
): Promise<UpdateVendorResponseSchema> {
  try {
    const db = getDB();

    const [updatedVendor] = await db.update(vendors).set(input).returning();

    return {
      data: updatedVendor,
      success: true
    };
  } catch (error) {
    return {
      error: (error as Error).message || "Failed to update vendor",
      success: false
    };
  }
}

// Delete vendor controller
export async function deleteVendorController(
  id: string
): Promise<MessageResponseT> {
  try {
    const db = getDB();

    await db.delete(vendors).where(eq(vendors.id, id));

    return {
      data: { message: "Vendor deleted successfully" },
      success: true
    };
  } catch (error) {
    return {
      error: (error as Error).message || "Failed to delete vendor",
      success: false
    };
  }
}
