// Cash drawer controllers

import { getDB } from "@/database";
import { cashDrawerBalance } from "@/database/schema/cashdrawer.schema";
import {
  GetCashDrawerBalanceResponse,
  InitializeCashDrawerBalanceResponse,
  SelectCashDrawerBalance,
  UpdateCashDrawerBalance,
  UpdateCashDrawerBalanceResponse
} from "@/lib/zod/cashflow.zod";
import { eq } from "drizzle-orm";

// * Cash Drawer Balance Controller
// 1. Initialize the cash drawer balance (if not exists)
// 2. Get current cash drawer balance
// 3. Update cash drawer balance after events

// * Cash Drawer Events Controllers
// 4. Start the shift with openning balance
// 5. End the shift with closing balance
// 6. Manual cash add or remove
// 7. Correction entries
// 8. Cash in and out for transactions

/**
 * Note: Implementation roadmap and idea
 * - When system initialize / open, check if cash drawer balance exists,
 * -  if not, initialize cash drawer balance with 0
 * -  if balance exsists, load the balance into zustand store
 * -  Show alert for user if cash drawer balance is 0
 *
 * - When system initialize, Check there are any active shift in zustand store,
 * -   if not, user can start a new shift by opening "Shift Management" modal
 * -    - In shift management modal, there will be option to enter opening balance with each denominations
 * -    - On starting shift, create a new cash drawer event with "opening_balance" type
 * -    - Update the cash drawer balance in database and refresh zustand store for updated balance.
 * -   if there is an active shift, check active shift older than 24 hours.
 * -    - If its older than 24 hours, expire the shift
 *        (User can start new shift by modal like in above step)
 * -   If active shift is valid, keep zustand store as it is.
 *
 * - When user perform cash in or cash out (from transaction),
 */

// ======= IMPLEMENTATION =======

// 1. Initialize Cash Drawer Balance Controller
export async function initializeCashDrawerBalanceController(): Promise<InitializeCashDrawerBalanceResponse> {
  try {
    const db = getDB();

    // Check if cash drawer balance already exists using direct select
    const existingBalance = await db
      .select()
      .from(cashDrawerBalance)
      .where(eq(cashDrawerBalance.isActive, true))
      .limit(1);

    if (existingBalance.length > 0) {
      // Balance already exists, return the existing balance
      return {
        success: true,
        data: existingBalance[0] as SelectCashDrawerBalance
      };
    }

    // No active balance found, create a new one with zero denominations
    const newBalance = await db
      .insert(cashDrawerBalance)
      .values({
        notes_5000: 0,
        notes_2000: 0,
        notes_1000: 0,
        notes_500: 0,
        notes_100: 0,
        notes_50: 0,
        notes_20: 0,
        coins_10: 0,
        coins_5: 0,
        coins_2: 0,
        coins_1: 0,
        totalAmount: 0,
        isActive: true,
        lastEventId: null,
        lastUpdatedBy: null
      })
      .returning();

    return {
      success: true,
      data: newBalance[0] as SelectCashDrawerBalance
    };
  } catch (error) {
    return {
      success: false,
      error:
        (error as Error).message || "Failed to initialize cash drawer balance"
    };
  }
}

// 2. Get Current Cash Drawer Balance Controller
export async function getCashDrawerBalanceController(): Promise<GetCashDrawerBalanceResponse> {
  try {
    const db = getDB();

    const balance = await db.query.cashDrawerBalance.findMany({
      limit: 1,
      where: (table) => eq(table.isActive, true),
      with: {
        lastEvent: true,
        lastUpdatedByUser: true
      }
    });

    if (balance.length === 0) {
      return {
        success: false,
        error: "No active cash drawer balance found. Please initialize first."
      };
    }

    return {
      success: true,
      data: balance[0] as SelectCashDrawerBalance
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || "Failed to get cash drawer balance"
    };
  }
}

// 3. Update cash drawer balance record Controller
export async function updateCashDrawerBalanceController(
  data: UpdateCashDrawerBalance
): Promise<UpdateCashDrawerBalanceResponse> {
  try {
    const db = getDB();

    // Get existing balance record
    const existingBalance = await db
      .select()
      .from(cashDrawerBalance)
      .where(eq(cashDrawerBalance.isActive, true))
      .limit(1);

    if (existingBalance.length === 0) {
      return {
        success: false,
        error: "No active cash drawer balance found. Please initialize first."
      };
    }

    const record = existingBalance[0];

    const updatedRes = await db
      .update(cashDrawerBalance)
      .set(data)
      .where(eq(cashDrawerBalance.id, record.id))
      .returning();

    if (updatedRes.length === 0)
      throw new Error("Failed to update cash drawer balance");

    const [updatedResult] = await db.query.cashDrawerBalance.findMany({
      limit: 1,
      where: (table, { eq }) => eq(table.id, updatedRes[0].id),
      with: {
        lastEvent: true,
        lastUpdatedByUser: true
      }
    });

    return { success: true, data: updatedResult };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || "Failed to update cash drawer balance"
    };
  }
}
