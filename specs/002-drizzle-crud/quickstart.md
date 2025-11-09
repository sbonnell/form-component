# Quickstart: Drizzle ORM CRUD Demo

**Feature**: 002-drizzle-crud  
**Date**: November 8, 2025  
**Prerequisites**: Node.js 18.17+, npm 9+

## Quick Setup (5 minutes)

### 1. Install Dependencies

```bash
# From project root
npm install drizzle-orm@^0.36.4 better-sqlite3@^11.8.0
npm install -D drizzle-kit@^0.28.1 @types/better-sqlite3@^7.6.12
```

### 2. Create Database Schema

Create file: `app/demo/crud/lib/db/schema.ts`

```typescript
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

### 3. Initialize Database Client

Create file: `app/demo/crud/lib/db/client.ts`

```typescript
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import path from 'path';
import * as schema from './schema';

const dbPath = path.join(process.cwd(), 'app/demo/crud/demo.db');
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });
```

### 4. Create Seed Data

Create file: `app/demo/crud/lib/db/seed.ts`

```typescript
import { db } from './client';
import { users, transactions, goods } from './schema';

export function seedDatabase() {
  // Clear existing data
  db.delete(transactions).run();
  db.delete(users).run();
  db.delete(goods).run();

  // Seed users (20 records)
  const userIds = [];
  for (let i = 1; i <= 20; i++) {
    const result = db.insert(users).values({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      age: 20 + i,
      status: i % 5 === 0 ? 'inactive' : 'active',
    }).returning({ id: users.id }).get();
    userIds.push(result.id);
  }

  // Seed transactions (20 records)
  for (let i = 1; i <= 20; i++) {
    db.insert(transactions).values({
      amount: 10 + (i * 50),
      date: new Date(Date.now() - i * 86400000), // Last 20 days
      status: i % 10 === 0 ? 'failed' : i % 3 === 0 ? 'pending' : 'completed',
      description: `Transaction ${i}`,
      type: i % 2 === 0 ? 'credit' : 'debit',
      userId: userIds[i % userIds.length],
    }).run();
  }

  // Seed goods (20 records)
  for (let i = 1; i <= 20; i++) {
    db.insert(goods).values({
      name: `Product ${i}`,
      description: `Description for product ${i}`,
      price: 9.99 + (i * 10),
      category: ['Electronics', 'Clothing', 'Books', 'Food'][i % 4],
      stockQuantity: i * 5,
      sku: `SKU-${String(i).padStart(5, '0')}`,
    }).run();
  }

  console.log('✅ Database seeded with 60 sample records');
}
```

### 5. Add to .gitignore

Add to `.gitignore`:

```
# Demo database
app/demo/crud/demo.db
app/demo/crud/demo.db-shm
app/demo/crud/demo.db-wal
```

### 6. Create Demo Page

Create file: `app/demo/crud/users/page.tsx`

```typescript
import { db } from '../lib/db/client';
import { users } from '../lib/db/schema';

export default async function UsersPage() {
  const allUsers = db.select().from(users).limit(10).all();

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Users CRUD Demo</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">ID</th>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {allUsers.map((user) => (
            <tr key={user.id}>
              <td className="border p-2">{user.id}</td>
              <td className="border p-2">{user.name}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 7. Initialize Database

Create initialization script or add to first page load:

```typescript
// app/demo/crud/lib/db/init.ts
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './client';
import { seedDatabase } from './seed';
import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'app/demo/crud/demo.db');

export function initializeDatabase() {
  const dbExists = fs.existsSync(dbPath);
  
  if (!dbExists) {
    console.log('Creating new database...');
    // Database file created automatically by better-sqlite3
  }

  // Run migrations (if using drizzle-kit)
  // migrate(db, { migrationsFolder: './app/demo/crud/migrations' });

  // Check if tables are empty, seed if needed
  const userCount = db.select({ count: count() }).from(users).get();
  if (userCount.count === 0) {
    console.log('Seeding database...');
    seedDatabase();
  }
}
```

### 8. Run Development Server

```bash
npm run dev
```

Navigate to: `http://localhost:3000/demo/crud/users`

---

## Directory Structure Created

```
app/demo/crud/
├── users/
│   └── page.tsx                  # Users demo page
├── lib/
│   └── db/
│       ├── schema.ts             # Drizzle table definitions
│       ├── client.ts             # Database connection
│       ├── seed.ts               # Sample data seeding
│       └── init.ts               # Database initialization
└── demo.db                       # SQLite database (gitignored)
```

---

## Next Steps

1. **Create CRUD Components**:
   - `CrudList.tsx` - Generic list view with pagination
   - `CrudForm.tsx` - Generic create/edit form
   - `ResetButton.tsx` - Demo data reset button

2. **Implement Schema Generator**:
   - `schema-generator.ts` - Convert Drizzle table → FormSchema
   - `type-mappings.ts` - Column type → Field type mappings

3. **Add CRUD Operations**:
   - `crud-operations.ts` - Generic CRUD functions for any table

4. **Create Remaining Demo Pages**:
   - `app/demo/crud/transactions/page.tsx`
   - `app/demo/crud/goods/page.tsx`

5. **Write Tests**:
   - Integration tests for schema generation
   - CRUD operation tests
   - Component tests for list/form UI

---

## Development Workflow

### Adding a New Entity

1. Define table in `schema.ts`
2. Add relations (if needed)
3. Add seed data in `seed.ts`
4. Create demo page in `app/demo/crud/{entity}/page.tsx`
5. Schema generation works automatically

### Resetting Demo Data

```typescript
import { seedDatabase } from './lib/db/seed';

// In a server action or API route
export async function resetDemoData() {
  seedDatabase();
  revalidatePath('/demo/crud');
}
```

---

## Troubleshooting

**Database locked error**:
- Close other SQLite connections
- Use WAL mode: `db.exec('PRAGMA journal_mode = WAL;')`

**Module not found: better-sqlite3**:
- Rebuild native module: `npm rebuild better-sqlite3`
- Ensure Node.js version >= 18.17

**Tables not created**:
- Run migrations or use Drizzle Kit push: `npx drizzle-kit push:sqlite`
- Check database file permissions

**Type errors with Drizzle**:
- Ensure `drizzle.config.ts` is configured
- Run `npx drizzle-kit generate:sqlite` to sync types

---

## Performance Tips

- **Enable WAL mode** for better concurrency
- **Add indexes** on frequently queried columns (see data-model.md)
- **Use prepared statements** for repeated queries
- **Cache schema generation** results in memory

---

## Security Notes

- ⚠️ Demo database in `/app` directory is for development only
- 🚫 Do not expose CRUD operations to production without authentication
- ✅ Validate all inputs with Zod schemas before database operations
- ✅ Use parameterized queries (Drizzle handles this automatically)

---

## Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [better-sqlite3 API](https://github.com/WiseLibs/better-sqlite3/blob/master/docs/api.md)
- [Drizzle Kit CLI](https://orm.drizzle.team/kit-docs/overview)
- [Schema-Driven Form Component](../../src/components/form-component/SchemaForm.tsx)

---

**Time to first working demo**: ~15 minutes  
**Lines of code**: ~200  
**Dependencies added**: 3 production, 2 dev

Ready to build! 🚀
