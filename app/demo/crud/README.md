# Drizzle CRUD Feature - Implementation Guide

## Overview

This feature adds automatic CRUD (Create, Read, Update, Delete) form generation from Drizzle ORM table definitions. Forms are generated dynamically from your database schema with proper validation, type handling, and form layout.

**Status**: Phase 2 Foundational Complete ✅  
**Build**: Compiling successfully ✅  
**Database**: sql.js with file-based persistence ✅

## Quick Start

### 1. Initialize Database

```typescript
import { initializeDB } from "@/app/demo/crud/lib/db/init";

// On app startup, initialize the database
await initializeDB();
```

This will:
- Create tables if they don't exist
- Create indexes for performance
- Seed sample data if tables are empty
- Persist to `app/demo/crud/demo.db`

### 2. Query Data

```typescript
import { selectRows, getRow, listRows } from "@/app/demo/crud/lib/db/crud";

// Get all users
const users = await selectRows("SELECT * FROM users");

// Get a single user
const user = await getRow("users", 1);

// Get paginated list
const result = await listRows("users", { page: 1, pageSize: 10 });
console.log(result.data);        // Array of users
console.log(result.totalPages);  // Total pages
```

### 3. Generate Forms

```typescript
import { generateFormSchema } from "@/app/demo/crud/lib/generator/schema-generator";
import { users } from "@/app/demo/crud/lib/db/schema";

// Get table columns
const columns = {
  id: { type: "integer", ... },
  name: { type: "text", ... },
  email: { type: "text", unique: true, ... },
  // ... other columns
};

// Generate form schema
const formSchema = generateFormSchema("users", columns, "create");

console.log(formSchema.fields);
// [
//   { name: "name", type: "text", label: "Name", required: true, ... },
//   { name: "email", type: "email", label: "Email", required: true, unique: true, ... },
//   ...
// ]
```

## Architecture

### Database Layer (`lib/db/`)

**`schema.ts`** - Drizzle ORM table definitions
- `users` - Application users with status
- `transactions` - Financial transactions linked to users
- `goods` - Product inventory

**`client.ts`** - Database initialization and lifecycle
- `getDatabase()` - Get initialized Drizzle instance
- `getSqlDb()` - Get sql.js Database for raw SQL
- `saveDatabase()` - Persist to file
- `resetDatabase()` - Reset database for testing

**`seed.ts`** - Sample data generation
- 5 users with mixed status
- 8 transactions with various types
- 8 goods with different categories

**`init.ts`** - Database initialization
- Create tables with proper schema
- Create indexes
- Auto-seed empty database

**`crud.ts`** - Generic CRUD operations
- `selectRows()` - Query multiple rows
- `selectOne()` - Query single row
- `insertRow()` - Insert and return row
- `updateRow()` - Update and return row
- `deleteRow()` - Delete row
- `listRows()` - Paginated list with count

### Generator Layer (`lib/generator/`)

**`type-mappings.ts`** - Type conversion configuration
- Maps Drizzle SQLite types to form field types
- Detects field types intelligently (email, date, select, etc.)
- Handles enums and unique constraints
- Generates field labels and help text

**`schema-generator.ts`** - Form schema generation
- `generateFormSchema()` - Convert table schema to form fields
- `generateAllFormSchemas()` - Create create/edit/list variants
- `schemaToJSON()` - Export for SchemaForm component
- Automatic field exclusion (id, timestamps)

## Type Mappings

| Drizzle Type | Form Type | Notes |
|---|---|---|
| integer | number | For numeric IDs and counts |
| real | number | For decimal values |
| text | text | Default text input |
| text (email) | email | Detected by column name |
| text (date) | datetime | Detected by column name |
| enum | select | Dropdown with options |
| boolean | checkbox | True/false toggle |

## Tables

### users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  age INTEGER,
  status TEXT NOT NULL DEFAULT 'active',  -- 'active' | 'inactive'
  created_at TEXT NOT NULL
);
```

### transactions
```sql
CREATE TABLE transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending' | 'completed' | 'failed'
  type TEXT NOT NULL,                      -- 'credit' | 'debit'
  description TEXT
);
```

### goods
```sql
CREATE TABLE goods (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  category TEXT NOT NULL,
  stock_quantity INTEGER NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL
);
```

## API Examples

### List Records
```typescript
import { listRows } from "@/app/demo/crud/lib/db/crud";

const result = await listRows("users", {
  page: 1,
  pageSize: 10
});

// Returns:
// {
//   data: User[],
//   total: 5,
//   page: 1,
//   pageSize: 10,
//   totalPages: 1
// }
```

### Create Record
```typescript
import { insertRow } from "@/app/demo/crud/lib/db/crud";

const newUser = await insertRow("users", {
  name: "John Doe",
  email: "john@example.com",
  age: 30,
  status: "active",
  created_at: new Date().toISOString()
});
```

### Get Record
```typescript
import { getRow } from "@/app/demo/crud/lib/db/crud";

const user = await getRow("users", 1);
```

### Update Record
```typescript
import { updateRow } from "@/app/demo/crud/lib/db/crud";

const updated = await updateRow("users", 1, {
  name: "Jane Doe",
  age: 31
});
```

### Delete Record
```typescript
import { deleteRow } from "@/app/demo/crud/lib/db/crud";

await deleteRow("users", 1);
```

### Validate Unique Constraint
```typescript
import { isUnique } from "@/app/demo/crud/lib/db/crud";

const isEmailAvailable = await isUnique("users", "email", "new@example.com");
```

## Schema Generation Example

```typescript
import { generateFormSchema } from "@/app/demo/crud/lib/generator/schema-generator";

// Table columns from Drizzle schema
const userColumns = {
  id: { columnType: "integer", notNull: true },
  name: { columnType: "text", notNull: true },
  email: { columnType: "text", notNull: true, unique: true },
  age: { columnType: "integer" },
  status: { columnType: "text", enumValues: ["active", "inactive"] },
  created_at: { columnType: "text", notNull: true }
};

// Generate create form schema
const createSchema = generateFormSchema("users", userColumns, "create");

// Result:
// {
//   tableName: "users",
//   mode: "create",
//   fields: [
//     {
//       name: "name",
//       type: "text",
//       label: "Name",
//       required: true,
//       helpText: undefined
//     },
//     {
//       name: "email",
//       type: "email",
//       label: "Email",
//       required: true,
//       unique: true,
//       helpText: "Enter a valid email address"
//     },
//     {
//       name: "age",
//       type: "number",
//       label: "Age",
//       required: false
//     },
//     {
//       name: "status",
//       type: "select",
//       label: "Status",
//       required: true,
//       enum: ["active", "inactive"]
//     }
//   ]
// }
```

## Integration with SchemaForm

The generated schema can be used directly with the existing SchemaForm component:

```typescript
import { SchemaForm } from "@/src/components/form-component/SchemaForm";
import { generateFormSchema } from "@/app/demo/crud/lib/generator/schema-generator";

// Generate schema
const schema = generateFormSchema("users", columns, "create");

// Use in form
export function UserCreateForm() {
  return (
    <SchemaForm
      schema={{
        fields: schema.fields.map(field => ({
          name: field.name,
          type: field.type,
          label: field.label,
          required: field.required,
          // ... other SchemaForm properties
        }))
      }}
      onSubmit={async (data) => {
        const user = await insertRow("users", data);
        console.log("Created user:", user);
      }}
    />
  );
}
```

## File Structure

```
app/demo/crud/
├── lib/
│   ├── db/
│   │   ├── schema.ts          # Drizzle ORM definitions
│   │   ├── client.ts          # Database init & lifecycle
│   │   ├── crud.ts            # Generic CRUD operations
│   │   ├── seed.ts            # Sample data
│   │   ├── init.ts            # Initialization logic
│   │   └── test-init.ts       # Verification script
│   └── generator/
│       ├── type-mappings.ts   # Type conversion rules
│       └── schema-generator.ts # Form schema generation
└── demo.db                     # SQLite database (created on first run)
```

## Configuration

### Database Location
The database is stored at: `app/demo/crud/demo.db`

To change location, edit `client.ts`:
```typescript
const DB_PATH = path.join(process.cwd(), "your/custom/path/demo.db");
```

### Sample Data
Customize sample data in `seed.ts`:
```typescript
const sampleUsers = [
  // Add/modify users here
];

const sampleTransactions = [
  // Add/modify transactions here
];

const sampleGoods = [
  // Add/modify goods here
];
```

### Auto-seeding
To disable auto-seeding, edit `init.ts` and remove the `await seedDatabase()` call.

## Performance Considerations

**sql.js Characteristics:**
- ✅ Works on all platforms (Windows, Mac, Linux)
- ✅ No C++ build tools required
- ✅ Easy setup and teardown for testing
- ⚠️ Slower than native SQLite on large datasets (>1MB)
- ⚠️ All data loaded into memory
- ⚠️ WASM initialization adds ~150KB to bundle

**For Production:**
Consider switching to better-sqlite3 (requires C++ tools) for better performance with large datasets.

## Testing

Quick verification script is available at:
```bash
# This runs the test in the import chain when database is initialized
npx ts-node app/demo/crud/lib/db/test-init.ts
```

## Limitations & Constraints

1. **Memory-based**: sql.js keeps database in memory
2. **No concurrent access**: File-based locking not available
3. **WASM initialization**: Adds startup latency
4. **Limited query builder**: Use raw SQL for complex queries
5. **No foreign key enforcement**: Implement in application logic

## Next Steps

The following features are in development:

1. **Demo Pages** - Users, Transactions, Goods list/create/edit/delete views
2. **CrudList Component** - Reusable list view with pagination
3. **CrudForm Component** - Reusable form with create/edit modes
4. **Delete Dialog** - Confirmation and constraint handling
5. **Reset Button** - Re-seed database for demo purposes

See `specs/002-drizzle-crud/tasks.md` for detailed implementation plan.

## Architecture Diagram

```
SchemaForm Component (src/)
        ↓
    Form Data
        ↓
CRUD Operations (lib/db/crud.ts)
        ↓
Schema Generator (lib/generator/)
        ↓
Type Mappings (lib/generator/type-mappings.ts)
        ↓
Drizzle ORM (lib/db/schema.ts)
        ↓
sql.js Database
        ↓
File: app/demo/crud/demo.db
```

## Related Documentation

- **Specification**: `specs/002-drizzle-crud/spec.md`
- **Research & Design**: `specs/002-drizzle-crud/research.md`
- **Data Model**: `specs/002-drizzle-crud/data-model.md`
- **API Contracts**: `specs/002-drizzle-crud/contracts/crud-operations.md`
- **Implementation Tasks**: `specs/002-drizzle-crud/tasks.md`
- **Implementation Status**: `specs/002-drizzle-crud/IMPLEMENTATION_STATUS.md`

## Support

For issues or questions:
1. Check the specification: `specs/002-drizzle-crud/spec.md`
2. Review the research: `specs/002-drizzle-crud/research.md`
3. Check the quickstart: `specs/002-drizzle-crud/quickstart.md`
