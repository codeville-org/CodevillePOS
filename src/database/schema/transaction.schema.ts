import { createId } from "@paralleldrive/cuid2";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex
} from "drizzle-orm/sqlite-core";

import { customers } from "./customers.schema";
import { timestamps } from "./helpers";
import { products } from "./products.schema";

export const transactions = sqliteTable(
  "transactions",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    transactionNumber: text("transaction_number").notNull().unique(),
    customerId: text("customer_id").references(() => customers.id, {
      onDelete: "set null"
    }),
    subtotalAmount: real("subtotal_amount").notNull(),
    discountAmount: real("discount_amount").notNull().default(0),
    taxAmount: real("tax_amount").notNull().default(0),
    totalAmount: real("total_amount").notNull(),
    paymentMethod: text("payment_method", {
      enum: ["cash", "card", "lend"]
    }).notNull(),
    cashReceived: real("cash_received"),
    changeGiven: real("change_given"),
    status: text("status", { enum: ["completed", "cancelled", "pending"] })
      .notNull()
      .default("completed"),
    notes: text("notes"),
    receiptPrinted: integer("receipt_printed", { mode: "boolean" })
      .notNull()
      .default(false),
    ...timestamps
  },
  (table) => [
    uniqueIndex("transactions_number_idx").on(table.transactionNumber),
    index("transactions_customer_idx").on(table.customerId),
    index("transactions_payment_method_idx").on(table.paymentMethod),
    index("transactions_status_idx").on(table.status),
    index("transactions_date_idx").on(table.createdAt)
  ]
);

// Transaction Items Table
export const transactionItems = sqliteTable(
  "transaction_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),
    transactionId: text("transaction_id")
      .notNull()
      .references(() => transactions.id, { onDelete: "cascade" }),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null"
    }),
    productName: text("product_name").notNull(), // Snapshot at time of sale
    productBarcode: text("product_barcode"), // Snapshot at time of sale
    unitPrice: real("unit_price").notNull(),
    ourPrice: real("our_price"),
    unitAmount: integer("unit_amount").default(1),
    unit: text("unit").default("pcs"), // pcs, kg, liter, etc.
    quantity: real("quantity").notNull(),
    totalAmount: real("total_amount").notNull(),
    discountAmount: real("discount_amount").notNull().default(0),
    ...timestamps
  },
  (table) => [
    index("transaction_items_transaction_idx").on(table.transactionId),
    index("transaction_items_product_idx").on(table.productId)
  ]
);
