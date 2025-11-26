/**
 * Controllers List
 * 1. Initialize Transaction
 * 2. Update Transaction Details
 * 3. Add new Transaction Item/s
 * 4. Delete Transaction
 */

import { getDB } from "@/database";
import { transactionItems, transactions } from "@/database/schema";
import { generateUniqueId } from "@/lib/utils";
import { TransactionsQueryParamsSchema } from "@/lib/zod/helpers";
import {
  AddNewTransactionItemsResponse,
  BaseTransactionItemSchema,
  CreateTransactionSchema,
  DeleteTransactionResponse,
  GetAllTransactionsResponse,
  GetTransactionResponse,
  InitializeTransactionResponse,
  PaymentMethod,
  PaymentStatus,
  SelectTransactionSchema,
  UninitializedTransactionItem,
  UpdateTransactionResponse,
  UpdateTransactionSchema
} from "@/lib/zod/transactions.zod";
import { and, desc, eq, sql } from "drizzle-orm";

// ========= Get all Transaction Controller =========
export async function getAllTransactionsController(
  query: TransactionsQueryParamsSchema
): Promise<GetAllTransactionsResponse> {
  try {
    const db = getDB();
    const { search, page, limit, sort, customer } = query;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit))); // Cap at 100 items
    const offset = (pageNum - 1) * limitNum;

    // Build where conditions
    const whereConditions: any[] = [];

    if (search) {
      whereConditions.push(
        sql`LOWER(${transactions.transactionNumber}) LIKE LOWER(${`%${search}%`})`
      );
    }

    if (customer) {
      whereConditions.push(sql`${transactions.customerId} = ${customer}`);
    }

    const transactionQuery = db.query.transactions.findMany({
      where: whereConditions.length ? and(...whereConditions) : undefined,
      orderBy:
        sort.toLowerCase() === "asc"
          ? transactions.createdAt
          : desc(transactions.createdAt),
      limit: limitNum,
      offset,
      with: {
        customer: true,
        items: true
      }
    });

    // Get total count for pagination metadata
    const totalCountQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(transactions)
      .where(whereConditions.length ? and(...whereConditions) : undefined);

    const [transactionEntries, _totalCount] = await Promise.all([
      transactionQuery,
      totalCountQuery
    ]);

    const totalCount = _totalCount[0]?.count || 0;

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);

    const formattedEntries: SelectTransactionSchema[] = transactionEntries.map(
      (entry) => ({
        ...entry,
        status: entry.status as PaymentStatus,
        paymentMethod: entry.paymentMethod as PaymentMethod,
        customer: entry.customer,
        items: entry.items
      })
    );

    return {
      data: {
        data: formattedEntries,
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
    console.log(error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// ========= Get Single Transaction Controller =========
export async function getTransactionByIDController(
  id: string
): Promise<GetTransactionResponse> {
  try {
    const db = getDB();

    // Build where conditions
    const whereConditions: any[] = [];

    whereConditions.push(eq(transactions.id, id));

    const transactionQuery = db.query.transactions.findFirst({
      where: whereConditions.length ? and(...whereConditions) : undefined,
      with: {
        customer: true,
        items: true
      }
    });

    const entry = await transactionQuery;

    const formattedEntry: SelectTransactionSchema = {
      ...entry,
      status: entry.status as PaymentStatus,
      paymentMethod: entry.paymentMethod as PaymentMethod,
      customer: entry.customer,
      items: entry.items
    };

    return {
      data: formattedEntry,
      success: true,
      error: null
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: (error as Error).message
    };
  }
}

// ========= Initialize Transaction Controller =========
export async function initializeTransactionController(
  body: CreateTransactionSchema
): Promise<InitializeTransactionResponse> {
  try {
    const db = getDB();

    // Generate random 12 digits number
    const generatedTransactionNumber = generateUniqueId();

    // Initialize transaction
    const initialized = await db
      .insert(transactions)
      .values({
        ...body,
        subtotalAmount: 0,
        totalAmount: 0,
        transactionNumber: generatedTransactionNumber,
        paymentMethod: "cash"
      })
      .returning();

    if (initialized.length < 1)
      throw new Error("Failed to initialized transaction");

    return {
      data: initialized[0],
      error: null,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
      success: false
    };
  }
}

// ========= Update Transaction Controller =========
export async function updateTransactionController(
  id: string,
  body: UpdateTransactionSchema
): Promise<UpdateTransactionResponse> {
  try {
    const db = getDB();

    const updated = await db
      .update(transactions)
      .set(body)
      .where(eq(transactions.id, id))
      .returning();

    if (updated.length < 1) throw new Error("Failed to update transaction");

    return {
      data: updated[0],
      error: null,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
      success: false
    };
  }
}

// ========= Add new Transaction Item Controller =========
export async function addNewTransactionItemController(
  transactionId: string,
  items: UninitializedTransactionItem[]
): Promise<AddNewTransactionItemsResponse> {
  try {
    const db = getDB();

    const addedItems: BaseTransactionItemSchema[] = [];

    await Promise.all(
      items.map(async (item) => {
        const addedItem = await db
          .insert(transactionItems)
          .values({
            ...item,
            transactionId: transactionId,
            productName: item.productName!,
            unitPrice: item.unitPrice!,
            ourPrice: item.ourPrice!,
            unitAmount: item.unitAmount!,
            unit: item.unit!,
            quantity: item?.quantity || 1,
            totalAmount: item?.totalAmount || item?.unitPrice || 0
          })
          .returning();

        if (addedItem.length > 0) addedItems.push(addedItem[0]);
      })
    );

    if (addedItems.length < 1)
      throw new Error("Failed to add new transaction items");

    return {
      data: addedItems,
      error: null,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
      success: false
    };
  }
}

// ========= Delete Transaction Controller =========
export async function deleteTransactionController(
  id: string
): Promise<DeleteTransactionResponse> {
  try {
    const db = getDB();

    await db.delete(transactions).where(eq(transactions.id, id));

    return {
      data: { message: "Transaction deleted successfully !" },
      error: null,
      success: true
    };
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
      success: false
    };
  }
}
