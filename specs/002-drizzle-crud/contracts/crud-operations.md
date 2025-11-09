# CRUD Operations Contract

**Feature**: 002-drizzle-crud  
**Date**: November 8, 2025  
**Purpose**: Define interfaces for generic CRUD operations and schema generation

## Generic CRUD Interface

All CRUD operations follow a standard pattern for any entity (User, Transaction, Goods).

### List Records

**Operation**: Retrieve paginated list of records from a table

**Request**:
```typescript
interface ListRequest {
  table: string;           // Table name: 'users', 'transactions', 'goods'
  page: number;            // Page number (1-indexed)
  pageSize?: number;       // Records per page (default: 10)
}
```

**Response**:
```typescript
interface ListResponse<T> {
  data: T[];              // Array of records
  pagination: {
    page: number;         // Current page
    pageSize: number;     // Records per page
    totalRecords: number; // Total records in table
    totalPages: number;   // Total pages available
  };
}
```

**Example**:
```typescript
// Request
{ table: 'users', page: 1, pageSize: 10 }

// Response
{
  data: [
    { id: 1, name: 'John Doe', email: 'john@example.com', ... },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', ... },
    // ... 8 more records
  ],
  pagination: {
    page: 1,
    pageSize: 10,
    totalRecords: 50,
    totalPages: 5
  }
}
```

---

### Get Single Record

**Operation**: Retrieve one record by ID

**Request**:
```typescript
interface GetRequest {
  table: string;           // Table name
  id: number;              // Record ID
}
```

**Response**:
```typescript
interface GetResponse<T> {
  data: T | null;          // Record or null if not found
}
```

**Errors**:
- 404: Record not found

---

### Create Record

**Operation**: Insert new record into table

**Request**:
```typescript
interface CreateRequest<T> {
  table: string;           // Table name
  data: Omit<T, 'id'>;     // Record data (excluding auto-generated ID)
}
```

**Response**:
```typescript
interface CreateResponse<T> {
  data: T;                 // Newly created record (with ID)
}
```

**Errors**:
- 400: Validation error (required field missing, format invalid)
- 409: Unique constraint violation (duplicate email, SKU, etc.)

**Example**:
```typescript
// Request
{
  table: 'users',
  data: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 30,
    status: 'active'
  }
}

// Response
{
  data: {
    id: 51,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    age: 30,
    status: 'active',
    createdAt: '2025-11-08T10:30:00Z'
  }
}
```

---

### Update Record

**Operation**: Modify existing record

**Request**:
```typescript
interface UpdateRequest<T> {
  table: string;           // Table name
  id: number;              // Record ID to update
  data: Partial<Omit<T, 'id'>>; // Fields to update (excluding ID)
}
```

**Response**:
```typescript
interface UpdateResponse<T> {
  data: T;                 // Updated record
}
```

**Errors**:
- 400: Validation error
- 404: Record not found (already deleted)
- 409: Unique constraint violation

**Concurrency Handling**: Last-write-wins (no version checking)

---

### Delete Record

**Operation**: Remove record from table

**Request**:
```typescript
interface DeleteRequest {
  table: string;           // Table name
  id: number;              // Record ID to delete
}
```

**Response**:
```typescript
interface DeleteResponse {
  success: boolean;        // true if deleted
  message?: string;        // Optional message (e.g., foreign key error)
}
```

**Errors**:
- 404: Record not found
- 409: Foreign key constraint (e.g., user has transactions)

---

## Schema Generation Contract

### Generate Form Schema

**Operation**: Convert Drizzle table definition to SchemaForm-compatible JSON schema

**Request**:
```typescript
interface GenerateSchemaRequest {
  table: string;           // Table name: 'users', 'transactions', 'goods'
  mode: 'create' | 'edit'; // Form mode (affects which fields shown)
}
```

**Response**:
```typescript
interface GenerateSchemaResponse {
  schema: FormSchema;      // Compatible with existing SchemaForm component
}

interface FormSchema {
  fields: FormField[];
  layout?: 'grid' | 'tabs' | 'wizard';
}

interface FormField {
  name: string;                    // Field name (matches column name)
  label: string;                   // Human-readable label
  type: FieldType;                 // Input type
  validation?: ValidationRules;    // Zod validation rules
  options?: SelectOption[];        // For select/enum fields
  layout?: FieldLayout;            // Responsive layout hints
}

type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'datetime' | 'textarea';

interface SelectOption {
  value: string | number;
  label: string;
}

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

interface FieldLayout {
  width?: 'full' | 'half' | 'third' | 'quarter';
  column?: number;
  offset?: number;
}
```

**Example**:
```typescript
// Request
{ table: 'users', mode: 'create' }

// Response
{
  schema: {
    fields: [
      {
        name: 'name',
        label: 'Name',
        type: 'text',
        validation: { required: true, maxLength: 100 },
        layout: { width: 'full' }
      },
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        validation: { required: true, pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$' },
        layout: { width: 'full' }
      },
      {
        name: 'age',
        label: 'Age',
        type: 'number',
        validation: { min: 0, max: 150 },
        layout: { width: 'half' }
      },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'active', label: 'Active' },
          { value: 'inactive', label: 'Inactive' }
        ],
        validation: { required: true },
        layout: { width: 'half' }
      }
    ],
    layout: 'grid'
  }
}
```

**Field Exclusions**:
- `mode: 'create'`: Exclude primary key (auto-increment), createdAt (auto-generated)
- `mode: 'edit'`: Exclude primary key, createdAt (immutable)

---

## Reset Demo Data Contract

### Reset Database

**Operation**: Drop all tables and re-seed with sample data

**Request**:
```typescript
interface ResetRequest {
  confirm: boolean;        // Must be true (safety check)
}
```

**Response**:
```typescript
interface ResetResponse {
  success: boolean;
  message: string;         // e.g., "Database reset successfully with 60 sample records"
  recordCounts: {
    users: number;
    transactions: number;
    goods: number;
  };
}
```

**Example**:
```typescript
// Request
{ confirm: true }

// Response
{
  success: true,
  message: "Database reset successfully with 60 sample records",
  recordCounts: {
    users: 20,
    transactions: 20,
    goods: 20
  }
}
```

---

## Error Response Format

All operations use consistent error response format:

```typescript
interface ErrorResponse {
  error: {
    code: string;          // Error code: 'VALIDATION_ERROR', 'NOT_FOUND', 'UNIQUE_CONSTRAINT', 'FOREIGN_KEY'
    message: string;       // User-friendly error message
    details?: unknown;     // Additional context (validation errors, etc.)
  };
}
```

**Error Codes**:

| Code | HTTP Status | Description | Example |
|------|-------------|-------------|---------|
| VALIDATION_ERROR | 400 | Invalid input data | Missing required field, invalid email |
| NOT_FOUND | 404 | Record doesn't exist | Editing deleted record |
| UNIQUE_CONSTRAINT | 409 | Duplicate value | Email already exists |
| FOREIGN_KEY | 409 | Referenced by other records | Cannot delete user with transactions |
| DATABASE_ERROR | 500 | SQLite error | Database file locked, disk full |

---

## Type Mappings Reference

See research.md for complete Drizzle column type → Form field type mappings.

**Quick Reference**:
- `integer()` → `number`
- `text()` → `text`
- `text({ enum })` → `select`
- `real()` → `number`
- `integer({ mode: 'boolean' })` → `checkbox`
- `integer({ mode: 'timestamp' })` → `datetime`
- `integer().references()` → `select` (with foreign key options)
