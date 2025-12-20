import { createId } from "@paralleldrive/cuid2";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex
} from "drizzle-orm/sqlite-core";

import { timestamps } from "./helpers";

export const users = sqliteTable(
  "users",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => createId()),

    username: text("username").unique().notNull(),
    email: text("email"),

    password: text("password").notNull(),

    isAdmin: integer("is_admin", { mode: "boolean" }).default(false),

    ...timestamps
  },
  (table) => [
    uniqueIndex("users_username_idx").on(table.username),
    index("users_email_idx").on(table.email),
    index("users_role_idx").on(table.isAdmin)
  ]
);
