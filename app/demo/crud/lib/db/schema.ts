import {
  sqliteTable,
  text,
  integer,
  real,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// User table
export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    age: integer("age"),
    status: text("status", { enum: ["active", "inactive"] })
      .notNull()
      .default("active"),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  })
);

// Transaction table
export const transactions = sqliteTable(
  "transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    userId: integer("user_id").notNull(),
    amount: real("amount").notNull(),
    date: text("date")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
    status: text("status", {
      enum: ["pending", "completed", "failed"],
    })
      .notNull()
      .default("pending"),
    type: text("type", { enum: ["credit", "debit"] }).notNull(),
    description: text("description"),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
  })
);

// Goods table
export const goods = sqliteTable(
  "goods",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    price: real("price").notNull(),
    category: text("category").notNull(),
    stockQuantity: integer("stock_quantity").notNull(),
    sku: text("sku").notNull().unique(),
    createdAt: text("created_at")
      .notNull()
      .$defaultFn(() => new Date().toISOString()),
  },
  (table) => ({
    skuIdx: uniqueIndex("sku_idx").on(table.sku),
    categoryIdx: index("category_idx").on(table.category),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Goods = typeof goods.$inferSelect;
export type NewGoods = typeof goods.$inferInsert;
