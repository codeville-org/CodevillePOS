import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text
} from "drizzle-orm/sqlite-core";
import { timestamps } from "./helpers";
import { transactions } from "./transaction.schema";
import { users } from "./user.schema";

export const cashDrawerEvents = sqliteTable(
  "cash_drawer_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    // Event metadata
    eventType: text("event_type", {
      enum: [
        "opening_balance", // Morning cash count
        "cash_in", // Cash received from customer
        "cash_out", // Change given to customer
        "manual_add", // Admin manually adds cash
        "manual_remove", // Admin manually removes cash
        "shift_end", // End of shift reconciliation
        "correction" // Balance correction
      ]
    }).notNull(),

    // Financial data
    totalAmount: real("total_amount").notNull(), // Net amount change

    // Sri Lankan currency denominations (counts)
    notes_5000: integer("notes_5000").default(0).notNull(),
    notes_2000: integer("notes_2000").default(0).notNull(),
    notes_1000: integer("notes_1000").default(0).notNull(),
    notes_500: integer("notes_500").default(0).notNull(),
    notes_100: integer("notes_100").default(0).notNull(),
    notes_50: integer("notes_50").default(0).notNull(),
    notes_20: integer("notes_20").default(0).notNull(),

    coins_10: integer("coins_10").default(0).notNull(),
    coins_5: integer("coins_5").default(0).notNull(),
    coins_2: integer("coins_2").default(0).notNull(),
    coins_1: integer("coins_1").default(0).notNull(),

    // Relationships and context
    transactionId: text("transaction_id").references(() => transactions.id, {
      onDelete: "set null"
    }),
    userId: text("user_id")
      .references(() => users.id)
      .notNull(),

    // Additional metadata
    description: text("description"), // Optional notes/reason
    previousBalance: real("previous_balance"), // Balance before this event
    newBalance: real("new_balance"), // Balance after this event

    // System fields
    ...timestamps
  },
  (table) => [
    index("cashdrawer_event_id_idx").on(table.id),
    index("cashdrawer_event_transaction_id_idx").on(table.transactionId),
    index("cashdrawer_event_user_id_idx").on(table.userId)
  ]
);

// Cash drawer current state/balance table
export const cashDrawerBalance = sqliteTable(
  "cash_drawer_balance",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    // Current denomination counts
    notes_5000: integer("notes_5000").default(0).notNull(),
    notes_2000: integer("notes_2000").default(0).notNull(),
    notes_1000: integer("notes_1000").default(0).notNull(),
    notes_500: integer("notes_500").default(0).notNull(),
    notes_100: integer("notes_100").default(0).notNull(),
    notes_50: integer("notes_50").default(0).notNull(),
    notes_20: integer("notes_20").default(0).notNull(),

    coins_10: integer("coins_10").default(0).notNull(),
    coins_5: integer("coins_5").default(0).notNull(),
    coins_2: integer("coins_2").default(0).notNull(),
    coins_1: integer("coins_1").default(0).notNull(),

    // Calculated totals
    totalAmount: real("total_amount").notNull(),

    // Status tracking
    isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
    lastEventId: text("last_event_id").references(() => cashDrawerEvents.id),
    lastUpdatedBy: text("last_updated_by").references(() => users.id),

    // System fields
    ...timestamps
  },
  (table) => [
    index("cashdrawer_balance_id_idx").on(table.id),
    index("cashdrawer_balance_last_event_id_idx").on(table.lastEventId),
    index("cashdrawer_balance_last_updated_by_idx").on(table.lastUpdatedBy)
  ]
);

// Relations
export const cashDrawerEventsRelations = relations(
  cashDrawerEvents,
  ({ one }) => ({
    transaction: one(transactions, {
      fields: [cashDrawerEvents.transactionId],
      references: [transactions.id]
    }),
    user: one(users, {
      fields: [cashDrawerEvents.userId],
      references: [users.id]
    })
  })
);

export const cashDrawerBalanceRelations = relations(
  cashDrawerBalance,
  ({ one }) => ({
    lastEvent: one(cashDrawerEvents, {
      fields: [cashDrawerBalance.lastEventId],
      references: [cashDrawerEvents.id]
    }),
    lastUpdatedByUser: one(users, {
      fields: [cashDrawerBalance.lastUpdatedBy],
      references: [users.id]
    })
  })
);
