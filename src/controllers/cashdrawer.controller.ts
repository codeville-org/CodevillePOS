// Cash drawer controllers

import { getDB } from "@/database";
import {
  cashDrawerBalance,
  cashDrawerEvents
} from "@/database/schema/cashdrawer.schema";
import {
  EndShiftControllerResponse,
  GetActiveShiftResponse,
  GetAllShiftsInput,
  GetAllShiftsResponse,
  GetCashDrawerBalanceResponse,
  GetShiftEventsInput,
  GetShiftEventsResponse,
  InitializeCashDrawerBalanceResponse,
  InsertCashDrawerEvent,
  InsertCashDrawerEventResponse,
  SelectCashDrawerBalance,
  SelectShift,
  StartShiftControllerResponse,
  UpdateCashDrawerBalance,
  UpdateCashDrawerBalanceResponse
} from "@/lib/zod/cashflow.zod";
import { eq } from "drizzle-orm";
import { getUserByIdController } from "./user.controller";

// * Cash Drawer Balance Controller
// 1. Initialize the cash drawer balance (if not exists) - ✅
// 2. Get current cash drawer balance - ✅
// 3. Update cash drawer balance after events - ✅

// * Cash Drawer Events Controllers
// 4. Start the shift with openning balance - ✅
// 5. Get active shift details - ✅
// 6. End the shift with closing balance - ✅
// 7. Create cashdrawer event controller -

/**
 * Note: Implementation roadmap and idea
 * - When system initialize / open, check if cash drawer balance exists,
 * -  if not, initialize cash drawer balance with 0
 * -  if balance exsists, load the balance into zustand store
 * -  Show alert for user if cash drawer balance is 0
 *
 * - When system initialize, Check there are any active shift in zustand store,
 * -   if not, user can start a new shift by opening "Cashflow" modal
 * -    - On starting shift, create a new cash drawer event with "opening_balance" type
 * -    - Update the cash drawer balance in database and refresh zustand store for updated balance.
 * -   All active shift & cash drawrs are saved on zustand persist storage.
 */

// ======= IMPLEMENTATION =======

// 1. Initialize Cash Drawer Balance Controller
export async function initializeCashDrawerBalanceController(): Promise<InitializeCashDrawerBalanceResponse> {
  try {
    const db = getDB();

    // Check if cash drawer balance already exists using direct select
    const existingBalance = await db.query.cashDrawerBalance.findMany({
      limit: 1,
      where: (table) => eq(table.isActive, true),
      with: {
        lastEvent: true,
        lastUpdatedByUser: true
      }
    });

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

// 4. Start Shift Controller
export async function startShiftController(
  userId: string
): Promise<StartShiftControllerResponse> {
  try {
    const db = getDB();

    const today = new Date();

    // Check if there is already a event that fullfill following conditions
    // event type = "opening_balance"
    // and createdAt is today

    // NOTE: Uncomment if limit one shift per 1 day
    // today.setHours(0, 0, 0, 0);

    // const existingShiftEvent = await db.query.cashDrawerEvents.findMany({
    //   limit: 1,
    //   where: (table, { eq, and, gte }) =>
    //     and(eq(table.eventType, "opening_balance"), gte(table.createdAt, today))
    // });

    // if (existingShiftEvent.length > 0)
    //   throw new Error("Shift already started for today");

    // Get starting cashdrawer balance
    const balanceRes = await getCashDrawerBalanceController();

    if (!balanceRes.success || !balanceRes.data) {
      throw new Error(balanceRes.error || "Failed to get cash drawer balance");
    }

    const userById = await getUserByIdController(userId);

    if (!userById.success || !userById.data) {
      throw new Error(userById.error || "Failed to get user data");
    }

    const [startedShift] = await db
      .insert(cashDrawerEvents)
      .values({
        eventType: "opening_balance",
        createdAt: today,
        totalAmount: balanceRes.data.totalAmount,
        userId: userById.data.id,

        notes_5000: balanceRes.data.notes_5000,
        notes_2000: balanceRes.data.notes_2000,
        notes_1000: balanceRes.data.notes_1000,
        notes_500: balanceRes.data.notes_500,
        notes_100: balanceRes.data.notes_100,
        notes_50: balanceRes.data.notes_50,
        notes_20: balanceRes.data.notes_20,
        coins_1: balanceRes.data.coins_1,
        coins_2: balanceRes.data.coins_2,
        coins_5: balanceRes.data.coins_5,
        coins_10: balanceRes.data.coins_10,
        previousBalance: balanceRes.data.totalAmount,
        newBalance: balanceRes.data.totalAmount,
        description: `Shift started on ${today.toDateString()} with ${balanceRes.data.totalAmount} balance.`
      })
      .returning();

    return {
      success: true,
      data: {
        startedAt: new Date(),
        event: startedShift
      }
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || "Failed to start shift"
    };
  }
}

// 5. Get Active Shift Details Controller
export async function getActiveShiftController(): Promise<GetActiveShiftResponse> {
  try {
    const db = getDB();

    // Check if there is already a event that fullfill following conditions
    // event type = "opening_balance"
    // and createdAt is today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const latestStartedShiftEvent = await db.query.cashDrawerEvents.findMany({
      limit: 1,
      where: (table, { eq }) =>
        // NOTE: Uncomment to limit one shift per day
        // and(
        //   eq(table.eventType, "opening_balance"),
        //   gte(table.createdAt, today)
        // ),
        eq(table.eventType, "opening_balance"),
      orderBy: (table, { desc }) => [desc(table.createdAt)]
    });

    const latestEndShiftEvent = await db.query.cashDrawerEvents.findMany({
      limit: 1,
      where: (table, { eq }) =>
        // NOTE: Uncomment to limit one shift per day
        // and(eq(table.eventType, "shift_end"), gte(table.createdAt, today)),
        eq(table.eventType, "shift_end"),
      orderBy: (table, { desc }) => [desc(table.createdAt)]
    });

    // Check latest started shift event is after latest end shift event
    if (latestEndShiftEvent.length > 0 && latestStartedShiftEvent.length > 0) {
      if (
        latestEndShiftEvent[0].createdAt >= latestStartedShiftEvent[0].createdAt
      ) {
        return {
          success: false,
          error: "No active shift found for today"
        };
      }
    }

    if (latestStartedShiftEvent.length === 0) {
      return {
        success: false,
        error: "No active shift found for today"
      };
    }

    return {
      success: true,
      data: {
        startedAt: latestStartedShiftEvent[0].createdAt,
        event: latestStartedShiftEvent[0]
      }
    };
  } catch (error) {
    return {
      error: (error as Error).message || "Failed to get active shift details",
      success: false
    };
  }
}

// 6. End Shift Controller
export async function endShiftController(): Promise<EndShiftControllerResponse> {
  try {
    const db = getDB();

    const activeShiftRes = await getActiveShiftController();

    if (!activeShiftRes.success || !activeShiftRes.data) {
      throw new Error(activeShiftRes.error || "No active shift found");
    }

    const cashDrawerBalanceRes = await getCashDrawerBalanceController();

    if (!cashDrawerBalanceRes.success || !cashDrawerBalanceRes.data) {
      throw new Error(
        cashDrawerBalanceRes.error || "Failed to get cash drawer balance"
      );
    }

    const [endedShift] = await db
      .insert(cashDrawerEvents)
      .values({
        eventType: "shift_end",
        createdAt: new Date(),
        totalAmount: cashDrawerBalanceRes.data.totalAmount,
        userId: activeShiftRes.data.event.userId
      })
      .returning();

    return {
      success: true,
      data: {
        endedAt: new Date(),
        event: endedShift
      }
    };
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message || "Failed to end shift"
    };
  }
}

// 7. Cash In and Out for Transactions Controller
export async function createCashDrawerEventController(
  values: InsertCashDrawerEvent
): Promise<InsertCashDrawerEventResponse> {
  try {
    const db = getDB();

    const [newEvent] = await db
      .insert(cashDrawerEvents)
      .values({
        ...values,
        totalAmount: values.totalAmount,
        eventType: values.eventType,
        userId: values.userId
      })
      .returning();

    return {
      success: true,
      data: newEvent
    };
  } catch (error) {
    return {
      error: (error as Error).message || "Failed to create cash drawer event",
      success: false
    };
  }
}

// 8. Get all shifts by start and end times, controller
export async function getAllShiftsController(
  input: GetAllShiftsInput
): Promise<GetAllShiftsResponse> {
  try {
    const { search, page, limit, sort } = input;

    // Convert to numbers and validate
    const pageNum = Math.max(1, parseInt(page || "1"));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit || "10"))); // Cap at 100 items
    const offset = (pageNum - 1) * limitNum;

    const db = getDB();

    // Get all opening_balance events ordered by creation date
    const openingBalanceEvents = await db.query.cashDrawerEvents.findMany({
      where: (table, { eq }) => eq(table.eventType, "opening_balance"),
      orderBy: (table, { desc, asc }) => [
        sort?.toLowerCase() === "asc"
          ? asc(table.createdAt)
          : desc(table.createdAt)
      ],
      with: {
        user: true,
        transaction: true
      }
    });

    // Get all shift_end events
    const shiftEndEvents = await db.query.cashDrawerEvents.findMany({
      where: (table, { eq }) => eq(table.eventType, "shift_end"),
      orderBy: (table, { asc }) => [asc(table.createdAt)]
    });

    // Build shifts array by pairing opening_balance with shift_end events
    const allShifts = [];

    for (const openingEvent of openingBalanceEvents) {
      // Find the corresponding shift_end event that occurred after this opening_balance
      const correspondingShiftEnd = shiftEndEvents.find(
        (endEvent) =>
          endEvent.createdAt > openingEvent.createdAt &&
          endEvent.userId === openingEvent.userId
      );

      const shift = {
        startedAt: openingEvent.createdAt,
        endedAt: correspondingShiftEnd ? correspondingShiftEnd.createdAt : null,
        event: openingEvent
      } as SelectShift;

      // Apply search filter if provided
      if (search) {
        const searchLower = search.toLowerCase();

        const matchesSearch =
          openingEvent?.user?.username.toLowerCase().includes(searchLower) ||
          openingEvent.description?.toLowerCase().includes(searchLower) ||
          openingEvent.totalAmount.toString().includes(searchLower);

        if (matchesSearch) {
          allShifts.push(shift);
        }
      } else {
        allShifts.push(shift);
      }
    }

    // Calculate total count before pagination
    const totalCount = allShifts.length;

    // Apply pagination
    const paginatedShifts = allShifts.slice(offset, offset + limitNum);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);

    return {
      success: true,
      error: null,
      data: {
        data: paginatedShifts,
        meta: {
          currentPage: pageNum,
          limit: limitNum,
          totalCount,
          totalPages
        }
      }
    };
  } catch (error) {
    return {
      error: (error as Error).message || "Failed to get all shifts",
      success: false,
      data: null
    };
  }
}

// 9. Get all events for a shift controller
export async function getShiftEventsController(
  input: GetShiftEventsInput
): Promise<GetShiftEventsResponse> {
  try {
    const { startedAt, endedAt } = input;
    const db = getDB();

    // If endedAt is null or not provided, it means it's an active shift
    // Get events from startedAt to now
    const whereCondition = endedAt
      ? (table: any, { and, gte, lte }: any) =>
          and(gte(table.createdAt, startedAt), lte(table.createdAt, endedAt))
      : (table: any, { gte }: any) => gte(table.createdAt, startedAt);

    // Get all cash drawer events within the shift period
    const shiftEvents = await db.query.cashDrawerEvents.findMany({
      where: whereCondition,
      orderBy: (table, { asc }) => [asc(table.createdAt)],
      with: {
        user: true,
        transaction: true
      }
    });

    return {
      success: true,
      error: null,
      data: shiftEvents as any
    };
  } catch (error) {
    return {
      error: (error as Error).message || "Failed to get shift events",
      success: false,
      data: null
    };
  }
}
