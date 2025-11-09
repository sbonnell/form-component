# Data Model: Drizzle ORM CRUD Demo

**Feature**: 002-drizzle-crud  
**Date**: November 8, 2025  
**Source**: Derived from spec.md requirements and clarifications

## Overview

This data model defines three demo entities (User, Transaction, Goods) used to showcase auto-generated CRUD interfaces. All tables use SQLite via Drizzle ORM with better-sqlite3.

## Entity Definitions

### User

**Purpose**: Represents a person in the system

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| name | text | NOT NULL | User's full name |
| email | text | NOT NULL, UNIQUE | User's email address |
| age | integer | NULLABLE | User's age (optional) |
| status | text (enum) | NOT NULL, DEFAULT 'active' | Account status: 'active' or 'inactive' |
| createdAt | integer (timestamp) | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Validation Rules**:
- name: Required, max length 100 characters
- email: Required, valid email format, unique
- age: Optional, must be positive integer if provided
- status: Must be 'active' or 'inactive'

**Relationships**:
- One User → Many Transactions (userId foreign key)

**Sample Data** (20+ records):
- Realistic names (John Doe, Jane Smith, etc.)
- Valid email addresses
- Mixed ages (18-75) and statuses
- Creation timestamps spread over past 90 days

---

### Transaction

**Purpose**: Represents a financial or data transaction

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| amount | real | NOT NULL | Transaction amount (decimal) |
| date | integer (timestamp) | NOT NULL | Transaction date/time |
| status | text (enum) | NOT NULL | Transaction status: 'pending', 'completed', or 'failed' |
| description | text | NULLABLE | Transaction description (optional) |
| type | text (enum) | NOT NULL | Transaction type: 'credit' or 'debit' |
| userId | integer | NOT NULL, FOREIGN KEY → users.id | Reference to User |

**Validation Rules**:
- amount: Required, must be > 0
- date: Required, valid timestamp
- status: Must be 'pending', 'completed', or 'failed'
- type: Must be 'credit' or 'debit'
- description: Optional, max length 500 characters
- userId: Required, must reference existing user

**Relationships**:
- Many Transactions → One User (userId)

**Sample Data** (20+ records):
- Amounts ranging from $10 to $5,000
- Mix of credit/debit types
- Various statuses (mostly completed, some pending, few failed)
- Descriptions like "Payment for services", "Monthly subscription", etc.
- References to seeded users

---

### Goods

**Purpose**: Represents products or inventory items

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | integer | PRIMARY KEY, AUTO INCREMENT | Unique identifier |
| name | text | NOT NULL | Product name |
| description | text | NULLABLE | Product description (optional) |
| price | real | NOT NULL | Product price (decimal) |
| category | text | NOT NULL | Product category |
| stockQuantity | integer | NOT NULL, DEFAULT 0 | Available stock count |
| sku | text | NOT NULL, UNIQUE | Stock Keeping Unit code |
| createdAt | integer (timestamp) | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Record creation time |

**Validation Rules**:
- name: Required, max length 200 characters
- description: Optional, max length 1000 characters
- price: Required, must be >= 0
- category: Required (e.g., "Electronics", "Clothing", "Food")
- stockQuantity: Required, must be >= 0
- sku: Required, unique, alphanumeric format (e.g., "SKU-12345")

**Relationships**:
- None (independent entity)

**Sample Data** (20+ records):
- Various products (laptops, phones, shirts, books, food items)
- Realistic prices ($5 to $2,000)
- Mixed categories (Electronics, Clothing, Books, Food, etc.)
- Stock quantities from 0 (out of stock) to 500
- Unique SKU codes

---

## Database Schema (Drizzle ORM)

```typescript
// app/demo/crud/lib/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  age: integer('age'),
  status: text('status', { enum: ['active', 'inactive'] }).notNull().default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  amount: real('amount').notNull(),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  status: text('status', { enum: ['pending', 'completed', 'failed'] }).notNull(),
  description: text('description'),
  type: text('type', { enum: ['credit', 'debit'] }).notNull(),
  userId: integer('user_id').notNull().references(() => users.id),
});

export const goods = sqliteTable('goods', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  price: real('price').notNull(),
  category: text('category').notNull(),
  stockQuantity: integer('stock_quantity').notNull().default(0),
  sku: text('sku').notNull().unique(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

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
```

## State Transitions

### Transaction Status Flow

```
pending → completed (successful transaction)
pending → failed (transaction error)
completed → [terminal state]
failed → [terminal state]
```

**Rules**:
- Cannot transition from completed or failed to any other state
- Delete allowed only for failed transactions (business rule example)

### User Status Flow

```
active → inactive (user deactivation)
inactive → active (user reactivation)
```

**Rules**:
- No restrictions on status changes
- Deleting user with transactions requires handling (see cascade rules below)

## Cascade Rules

### User Deletion

**Rule**: Prevent deletion if user has associated transactions (FOREIGN KEY constraint)

**Error Message**: "Cannot delete user: user has associated transactions"

**Alternative**: Implement soft delete (set status='inactive') instead of hard delete

### Transaction Deletion

**Rule**: Allowed (no dependent records)

**Behavior**: Delete removes record from database

### Goods Deletion

**Rule**: Allowed (no dependent records)

**Behavior**: Delete removes record from database

## Data Integrity

### Constraints Enforced by SQLite

- PRIMARY KEY: Uniqueness + NOT NULL
- UNIQUE: email (users), sku (goods)
- FOREIGN KEY: userId → users.id (transactions)
- NOT NULL: All required fields as defined
- CHECK (via Zod validation): Positive amounts, valid enums

### Application-Level Validation

- Email format validation (Zod schema)
- Enum value validation (enforced by Drizzle + Zod)
- Text length limits (maxLength in Zod)
- Positive number checks (min validation)

## Indexing Strategy

**For Demo Performance** (optional, but recommended):

```typescript
// Add indexes for frequently queried fields
export const users = sqliteTable('users', {
  // ... fields
}, (table) => ({
  emailIdx: uniqueIndex('email_idx').on(table.email),
}));

export const transactions = sqliteTable('transactions', {
  // ... fields
}, (table) => ({
  userIdIdx: index('user_id_idx').on(table.userId),
  statusIdx: index('status_idx').on(table.status),
}));

export const goods = sqliteTable('goods', {
  // ... fields
}, (table) => ({
  skuIdx: uniqueIndex('sku_idx').on(table.sku),
  categoryIdx: index('category_idx').on(table.category),
}));
```

**Justification**:
- email_idx: Quick user lookup by email
- user_id_idx: Efficient transaction queries by user
- sku_idx: Fast goods lookup by SKU
- category_idx: Support category filtering

## Migration Strategy

**Initial Setup**:
1. Create database file if not exists
2. Run Drizzle migrations to create tables
3. Seed with sample data if tables are empty

**Reset Demo Data**:
1. Drop all tables
2. Recreate tables from schema
3. Re-seed with sample data

**Code**:
```typescript
// app/demo/crud/lib/db/migrations.ts
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './client';

export function runMigrations() {
  migrate(db, { migrationsFolder: './app/demo/crud/migrations' });
}
```

## Next Steps

- Create contracts/ directory with CRUD operation interfaces
- Define API response formats
- Document error handling patterns
