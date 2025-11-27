import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  index,
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex
} from "drizzle-orm/sqlite-core";

import { cashDrawerEvents } from "./cashdrawer.schema";
import { timestamps } from "./helpers";
import { products } from "./products.schema";

// Vendors Table
export const vendors = sqliteTable(
  "vendors",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    name: text("name").notNull(),
    description: text("description"),

    ...timestamps
  },
  (table) => [
    index("vendors_id_idx").on(table.id),
    uniqueIndex("vendors_name_idx").on(table.name)
  ]
);

export const purchases = sqliteTable(
  "purchases",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    purchaseDescription: text("purchase_description"),

    vendorId: text("vendor_id")
      .references(() => vendors.id, { onDelete: "cascade" })
      .notNull(),

    totalAmount: real("total_amount").notNull().default(0),
    paidAmount: real("paid_amount").notNull().default(0),
    dueAmount: real("due_amount").notNull().default(0),

    status: text("purchase_status", {
      enum: [
        "active", // Purchase Active
        "completed" // Purchase completed
      ]
    })
      .notNull()
      .default("active"),

    ...timestamps
  },
  (table) => [
    index("purchases_id_idx").on(table.id),
    index("purchase_vendor_idx").on(table.vendorId)
  ]
);

export const purchaseItems = sqliteTable(
  "purchase_items",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    purchaseId: text("purchase_id")
      .references(() => purchases.id, { onDelete: "cascade" })
      .notNull(),
    productId: text("product_id").references(() => products.id, {
      onDelete: "set null"
    }),

    quantity: integer("quantity").notNull(),
    unitPrice: real("unit_price").notNull(),
    totalPrice: real("total_price").notNull(),

    ...timestamps
  },
  (table) => [
    index("purchase_item_id_idx").on(table.id),
    index("purchase_item_purchase_idx").on(table.purchaseId),
    index("purchase_item_product_idx").on(table.productId)
  ]
);

// Relations
export const vendorsRelations = relations(vendors, ({ many }) => ({
  purchases: many(purchases)
}));

export const purchasesRelations = relations(purchases, ({ one, many }) => ({
  vendor: one(vendors, {
    fields: [purchases.vendorId],
    references: [vendors.id]
  }),
  cashDrawerEvents: many(cashDrawerEvents),
  purchaseItems: many(purchaseItems)
}));

export const purchaseItemsRelations = relations(purchaseItems, ({ one }) => ({
  purchase: one(purchases, {
    fields: [purchaseItems.purchaseId],
    references: [purchases.id]
  }),
  product: one(products, {
    fields: [purchaseItems.productId],
    references: [products.id]
  })
}));
