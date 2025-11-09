# Research: Drizzle ORM CRUD Auto-Generation

**Feature**: 002-drizzle-crud  
**Date**: November 8, 2025  
**Purpose**: Resolve technical unknowns and establish best practices for implementation

## Research Tasks

### 1. Drizzle ORM Version Selection

**Decision**: Use Drizzle ORM v0.36.4 (latest stable as of Nov 2025) with drizzle-orm and better-sqlite3 v11.8.0

**Rationale**:
- Drizzle ORM v0.36.x provides stable TypeScript-first API
- Better-sqlite3 v11.x is the recommended synchronous SQLite driver for Node.js
- Drizzle Kit v0.28.x for schema introspection and migrations
- Full TypeScript support with inferred types from schema definitions
- Zero-config setup for SQLite

**Alternatives Considered**:
- Prisma: More mature but requires schema.prisma file, less TypeScript-native
- TypeORM: Older, decorator-based approach, heavier runtime
- Raw better-sqlite3: No ORM layer, would require manual schema management

**Dependencies to Add**:
```json
{
  "drizzle-orm": "^0.36.4",
  "better-sqlite3": "^11.8.0",
  "drizzle-kit": "^0.28.1"
}
```

**Dev Dependencies**:
```json
{
  "@types/better-sqlite3": "^7.6.12"
}
```

---

### 2. Drizzle Schema Introspection Patterns

**Decision**: Use Drizzle's table definition metadata via `getTableColumns()` and column type information

**Rationale**:
- Drizzle exposes column metadata at runtime through table objects
- `getTableColumns(table)` returns column definitions with type info
- Can inspect: column name, data type, nullability, default values, constraints
- Type mappings available through Drizzle's column type system

**Implementation Pattern**:
```typescript
import { getTableColumns } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// Example table
const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
});

// Introspection
const columns = getTableColumns(users);
// Access column metadata: columns.name.notNull, columns.email.uniqueIndex, etc.
```

**Best Practices**:
- Read column metadata at runtime (not build-time code generation)
- Map SQLite column types to form field types
- Extract validation rules from column constraints
- Handle foreign keys through Drizzle's relations API

---

### 3. Drizzle Column Type to Form Field Type Mappings

**Decision**: Establish standard mapping table for SQLite → Form Schema conversion

**Mapping Table**:

| Drizzle SQLite Type | Form Field Type | Validation Rules |
|---------------------|-----------------|------------------|
| `integer()` | `number` | `z.number().int()` |
| `integer().primaryKey()` | Hidden (auto-increment) | N/A (excluded from forms) |
| `real()` | `number` | `z.number()` |
| `text()` | `text` | `z.string()` |
| `text().notNull()` | `text` (required) | `z.string().min(1)` |
| `text({ length: N })` | `text` | `z.string().max(N)` |
| `text({ enum: [...] })` | `select` | `z.enum([...])` |
| `integer().references()` | `select` (foreign key) | `z.number()` + options from ref table |
| `integer({ mode: 'boolean' })` | `checkbox` | `z.boolean()` |
| `integer({ mode: 'timestamp' })` | `datetime` | `z.date()` or `z.string().datetime()` |

**Implementation Strategy**:
- Create type guard functions to detect column types
- Build Zod schema based on column constraints
- Generate field configs with appropriate input types
- Handle special cases (enums, foreign keys, timestamps)

---

### 4. Foreign Key Handling and Dropdown Population

**Decision**: Use Drizzle relations to detect foreign keys and populate select options

**Pattern**:
```typescript
import { relations } from 'drizzle-orm';

const users = sqliteTable('users', { /* ... */ });
const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
});

const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// For form generation:
// 1. Detect userId is foreign key via relations
// 2. Query users table to get options
// 3. Generate select field with { value: id, label: name }
```

**Best Practices**:
- Define relations alongside table schemas
- Query referenced table for dropdown options
- Use reasonable display field (name, title, or first text column)
- Cache options in React Query for performance
- Support required vs optional foreign keys

---

### 5. SQLite File Location and Seeding Strategy

**Decision**: Store demo.db in `/app/demo/crud/` with .gitignore, seed on first access

**Rationale**:
- Keep database file colocated with demo code
- Add to .gitignore to avoid committing demo data
- Check if DB exists on page load, seed if missing or empty
- Implement "Reset Demo Data" button that drops tables and re-seeds

**Implementation**:
```typescript
// app/demo/crud/lib/db/client.ts
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'app/demo/crud/demo.db');
export const db = new Database(dbPath);

// Initialize schema and seed if needed
import { seedDatabase } from './seed';
if (!db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().length) {
  seedDatabase(db);
}
```

**Seeding Strategy**:
- Create 20+ realistic records per table
- Use faker.js or similar for realistic data generation
- Maintain referential integrity (transactions reference valid users)
- Provide reset endpoint/button to re-seed

---

### 6. List View Pagination Strategy

**Decision**: Use offset-based pagination with configurable page size (default 10)

**Rationale**:
- Simple to implement with SQL LIMIT/OFFSET
- Suitable for demo scale (100+ records)
- Drizzle supports `.limit()` and `.offset()` query builders
- Can add page size selector (10, 25, 50, 100)

**Implementation Pattern**:
```typescript
import { db } from './client';
import { users } from './schema';

function getUsers(page: number, pageSize: number = 10) {
  const offset = (page - 1) * pageSize;
  const rows = db.select().from(users).limit(pageSize).offset(offset).all();
  const total = db.select({ count: count() }).from(users).get();
  
  return {
    data: rows,
    page,
    pageSize,
    totalPages: Math.ceil(total.count / pageSize),
  };
}
```

**UI Components**:
- Previous/Next buttons
- Page number display (Page X of Y)
- Optional: Jump to page input
- Page size selector

---

### 7. Form Schema Generation Algorithm

**Decision**: Create `generateFormSchema()` function that analyzes Drizzle table and outputs compatible SchemaForm JSON

**Algorithm**:
1. Get table columns via `getTableColumns(table)`
2. For each column:
   - Skip if primary key with autoIncrement
   - Determine field type from column data type
   - Extract validation rules from constraints
   - Build field config object
3. Handle foreign keys as select fields with options
4. Apply layout hints (group related fields, responsive columns)
5. Return complete form schema matching existing SchemaForm format

**Output Format** (compatible with existing SchemaForm):
```typescript
{
  fields: [
    {
      name: 'name',
      label: 'Name',
      type: 'text',
      validation: { required: true, maxLength: 100 },
      layout: { width: 'full', column: 1 }
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ],
      validation: { required: true }
    }
  ],
  layout: 'grid'
}
```

---

### 8. Error Handling and Validation

**Decision**: Use Zod for validation (already in project), catch SQLite constraint errors

**Error Handling Strategy**:
- **Client-side**: Zod validation before submission
- **Server-side**: Catch SQLite errors (UNIQUE constraint, FOREIGN KEY)
- **User-friendly messages**: Map technical errors to readable text

**Error Message Mapping**:
- `SQLITE_CONSTRAINT_UNIQUE` → "This {field} already exists"
- `SQLITE_CONSTRAINT_FOREIGNKEY` → "Cannot delete: record is referenced by other data"
- `SQLITE_CONSTRAINT_NOTNULL` → "This field is required"

**Implementation**:
```typescript
try {
  db.insert(users).values(data).run();
} catch (error) {
  if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
    throw new Error(`Email ${data.email} already exists`);
  }
  throw error;
}
```

---

## Summary of Resolved Unknowns

| Unknown | Resolution |
|---------|------------|
| Drizzle ORM version | v0.36.4 with better-sqlite3 v11.8.0 |
| Schema introspection | Use `getTableColumns()` for runtime metadata access |
| Type mappings | Standard mapping table (integer→number, text→text, etc.) |
| Foreign keys | Detect via relations, populate dropdowns from referenced tables |
| Database location | `/app/demo/crud/demo.db` with .gitignore |
| Seeding strategy | Seed on first access, provide reset button |
| Pagination | Offset-based with configurable page size |
| Schema generation | `generateFormSchema()` algorithm using column metadata |
| Error handling | Zod validation + SQLite error mapping |

## Next Steps

Proceed to Phase 1:
- Create data-model.md with User, Transaction, Goods entity definitions
- Define contracts (CRUD operation interfaces)
- Generate quickstart.md with setup instructions
