# Feature Specification: Drizzle ORM CRUD with Auto-Generated Forms

**Feature Branch**: `002-drizzle-crud`  
**Created**: November 8, 2025  
**Status**: Draft  
**Input**: User description: "Utilising the existing Schema-Driven Form functionality provide functionality to automatically create schemas to perform CRUD operation on Drizzle ORM tables. For demo and testing purposes create a database with sample data for some common use case table like: user, transaction, goods. All demo and test functionality should be under /app and NOT /src"

## Clarifications

### Session 2025-11-08

- Q: Which database should be used for the demo CRUD functionality? → A: SQLite with better-sqlite3 (file-based, zero setup, perfect for demos)
- Q: How should search/filter work across table fields? → A: Remove search/filter requirement (not needed for initial demo)
- Q: How should demo data persist across page reloads and server restarts? → A: SQLite file persists across restarts, with optional "Reset Demo Data" button to re-seed
- Q: How should long text values be displayed in the list view table? → A: Truncate at 100 characters with ellipsis (...)
- Q: How should the system handle concurrent edits (multiple users editing the same record)? → A: Last write wins (no conflict detection, simpler for demo usage)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View List of Records (Priority: P1)

A user wants to view a paginated list of records from a database table (e.g., users, transactions, goods) to understand what data exists and identify records to edit or delete.

**Why this priority**: This is the foundation - users must see data before they can perform any CRUD operations. This delivers immediate value by making database content visible.

**Independent Test**: Can be fully tested by navigating to the demo page and viewing a pre-populated list of records with pagination controls, and delivers the ability to browse database content.

**Acceptance Scenarios**:

1. **Given** the database contains 50 user records, **When** I navigate to the users list page, **Then** I see the first 10 records displayed in a table with columns for all user fields
2. **Given** I am viewing the users list page, **When** I click the "Next Page" button, **Then** I see records 11-20 displayed
3. **Given** the users table has fields (id, name, email, created_at), **When** I view the list, **Then** I see column headers for each field with appropriate formatting

---

### User Story 2 - Create New Record (Priority: P1)

A user wants to add a new record to a database table by filling out an auto-generated form based on the table schema, so they can add new users, transactions, or goods to the system.

**Why this priority**: Creation is the most critical CRUD operation - without it, users cannot populate the database. This story depends only on having a table schema defined.

**Independent Test**: Can be fully tested by clicking "Add New" on any entity page, filling out the auto-generated form with valid data, submitting, and verifying the record appears in the list.

**Acceptance Scenarios**:

1. **Given** I am on the users list page, **When** I click "Add New User", **Then** a form is displayed with input fields matching the user table schema (name, email, etc.)
2. **Given** the create user form is displayed, **When** I fill out all required fields and click "Save", **Then** the new user is added to the database and I am redirected to the updated list showing the new record
3. **Given** the create form is displayed, **When** I leave a required field empty and click "Save", **Then** I see a validation error message indicating which fields are required
4. **Given** the user table has an email field with unique constraint, **When** I try to create a user with a duplicate email, **Then** I see an error message indicating the email already exists
5. **Given** I am filling out a create form, **When** I click "Cancel", **Then** no record is created and I return to the list page

---

### User Story 3 - Edit Existing Record (Priority: P2)

A user wants to modify an existing record by clicking an edit button, viewing the current values in a pre-filled form, making changes, and saving to update the database.

**Why this priority**: Editing is essential for data maintenance but requires creation to be working first. This builds on the list view (P1) by adding modification capability.

**Independent Test**: Can be fully tested by selecting any record from the list, clicking "Edit", modifying field values in the pre-filled form, saving, and verifying changes persist in the database.

**Acceptance Scenarios**:

1. **Given** I am viewing the users list, **When** I click the "Edit" button for a specific user, **Then** a form is displayed pre-filled with that user's current data
2. **Given** the edit form is displayed with current values, **When** I modify the email field and click "Save", **Then** the user's email is updated in the database and the list refreshes showing the new value
3. **Given** I am editing a record, **When** I modify a field to an invalid value (e.g., invalid email format) and click "Save", **Then** I see a validation error and the record is not updated
4. **Given** I am editing a record, **When** I click "Cancel", **Then** no changes are saved and I return to the list page showing original values

---

### User Story 4 - Delete Record (Priority: P2)

A user wants to remove a record from the database by clicking a delete button and confirming the action, to clean up obsolete or incorrect data.

**Why this priority**: Deletion is important for data hygiene but less critical than creation/viewing. It can be implemented after basic list and create functionality work.

**Independent Test**: Can be fully tested by selecting any record, clicking "Delete", confirming the action, and verifying the record no longer appears in the list or database.

**Acceptance Scenarios**:

1. **Given** I am viewing the users list, **When** I click the "Delete" button for a specific user, **Then** I see a confirmation dialog asking "Are you sure you want to delete this record?"
2. **Given** the delete confirmation dialog is displayed, **When** I click "Confirm", **Then** the record is removed from the database and the list refreshes without that record
3. **Given** the delete confirmation dialog is displayed, **When** I click "Cancel", **Then** the record is not deleted and remains in the list
4. **Given** a record has been deleted, **When** I try to view or edit it directly via URL, **Then** I see an error message indicating the record no longer exists

---

### User Story 5 - Auto-Generate Form Schema from Table (Priority: P1)

The system automatically generates a form schema compatible with the existing Schema-Driven Form component by analyzing a Drizzle ORM table definition, so developers don't need to manually create form schemas for CRUD operations.

**Why this priority**: This is the core technical capability that enables all other stories. Without auto-generation, developers would need to manually write schemas for every table, defeating the purpose of the feature.

**Independent Test**: Can be fully tested by defining a new Drizzle table schema, running the auto-generation function, and verifying it produces a valid form schema that renders correctly in the Schema-Driven Form component.

**Acceptance Scenarios**:

1. **Given** a Drizzle table with columns (id, name, email, age), **When** the auto-generation function runs, **Then** a form schema is created with corresponding fields (text input for name/email, number input for age)
2. **Given** a Drizzle table with a column marked as not nullable, **When** the schema is generated, **Then** the corresponding form field has `required: true` validation
3. **Given** a Drizzle table with a text column having a maximum length, **When** the schema is generated, **Then** the form field includes a maxLength validation rule
4. **Given** a Drizzle table with an enum column, **When** the schema is generated, **Then** the form field is a select dropdown with options matching the enum values
5. **Given** a Drizzle table with a timestamp column, **When** the schema is generated, **Then** the form field is a datetime input
6. **Given** a Drizzle table with a foreign key relationship, **When** the schema is generated, **Then** the form field is a select dropdown that loads options from the referenced table

---

### User Story 6 - Demo Pages for Common Tables (Priority: P3)

Developers and stakeholders can view working demo pages under `/app/demo/crud/` showing CRUD operations for common use cases (users, transactions, goods) with pre-populated sample data, to understand capabilities and test the feature.

**Why this priority**: Demos are valuable for testing and showcasing but not essential for core functionality. They can be added after the main CRUD operations work.

**Independent Test**: Can be fully tested by navigating to `/app/demo/crud/users`, `/app/demo/crud/transactions`, and `/app/demo/crud/goods` and verifying each page displays a working CRUD interface with sample data.

**Acceptance Scenarios**:

1. **Given** I navigate to `/app/demo/crud/users`, **When** the page loads, **Then** I see a list of at least 20 sample users with realistic names and email addresses
2. **Given** I navigate to `/app/demo/crud/transactions`, **When** the page loads, **Then** I see a list of sample transactions with fields like amount, date, status, and user references
3. **Given** I navigate to `/app/demo/crud/goods`, **When** the page loads, **Then** I see a list of sample products/goods with fields like name, price, category, and stock quantity
4. **Given** I am on any demo CRUD page, **When** I perform any CRUD operation (create, edit, delete), **Then** the operation succeeds and data persists across page reloads and server restarts
5. **Given** I am on any demo CRUD page, **When** I click the "Reset Demo Data" button, **Then** the database is re-seeded with the original sample data

---

### Edge Cases

- What happens when a table has no records (empty state messaging)?
- What happens if the database connection fails during a CRUD operation (error handling)?
- How does pagination behave when the total record count changes (e.g., after deletion)?
- What happens when a table has many columns (horizontal scrolling or column selection)?
- How are date/time values formatted in the list view for different timezones?
- What happens if auto-generation encounters an unsupported Drizzle column type?
- How does the system handle cascading deletes (if a record has foreign key dependencies)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically generate form schemas from Drizzle ORM table definitions that are compatible with the existing Schema-Driven Form component
- **FR-002**: System MUST map Drizzle column types to appropriate form field types (text, number, date, select, checkbox, etc.)
- **FR-003**: System MUST transfer validation rules from Drizzle schema (required, maxLength, min/max, enum values) to form schema validation
- **FR-004**: System MUST provide a list view component that displays all records from a table with pagination
- **FR-005**: System MUST provide a create form that uses the auto-generated schema to add new records to the database
- **FR-006**: System MUST provide an edit form that pre-fills with existing record data and updates the database on save
- **FR-007**: System MUST provide a delete function with confirmation dialog before removing records
- **FR-009**: System MUST display validation errors clearly when form submission fails (required fields, format errors, unique constraints)
- **FR-010**: System MUST handle database errors gracefully with user-friendly error messages
- **FR-011**: System MUST support pagination controls (first, previous, next, last, page size selection)
- **FR-012**: System MUST provide demo pages under `/app/demo/crud/` for users, transactions, and goods tables
- **FR-013**: Demo database MUST be pre-populated with realistic sample data (at least 20 records per table)
- **FR-013a**: Demo database MUST use SQLite with better-sqlite3 for zero-setup, file-based persistence
- **FR-013b**: Demo data MUST persist across server restarts and page reloads
- **FR-013c**: System MUST provide a "Reset Demo Data" button to re-seed the database with original sample data
- **FR-014**: System MUST format dates, times, and currency values appropriately in list views
- **FR-014a**: System MUST truncate text values longer than 100 characters in list view with ellipsis (...)
- **FR-015**: System MUST handle null values by showing empty states in list view and optional fields in forms
- **FR-016**: System MUST prevent deletion of records with foreign key dependencies or show appropriate error message
- **FR-017**: Edit forms MUST show current values when opened and indicate which fields have been modified
- **FR-017a**: System MUST use last-write-wins strategy for concurrent edits (no version conflict detection)
- **FR-017b**: System MUST show error message if attempting to edit or delete a record that no longer exists
- **FR-018**: System MUST redirect to appropriate pages after successful CRUD operations (list view after create/edit/delete)
- **FR-019**: All demo and test functionality MUST be located under `/app` directory, NOT `/src`
- **FR-020**: System MUST support foreign key relationships by providing dropdown selects that load options from referenced tables

### Key Entities

- **User**: Represents a person in the system with fields like id (auto-increment primary key), name (text), email (text, unique), created_at (timestamp), age (optional number), and status (enum: active/inactive)

- **Transaction**: Represents a financial or data transaction with fields like id (auto-increment primary key), amount (decimal/number), date (timestamp), status (enum: pending/completed/failed), description (text), user_id (foreign key to User table), and type (enum: credit/debit)

- **Goods**: Represents products or inventory items with fields like id (auto-increment primary key), name (text), description (text, optional), price (decimal/number), category (enum or text), stock_quantity (integer), sku (text, unique), and created_at (timestamp)

- **Form Schema**: Auto-generated configuration object that defines form fields, validation rules, layout, and field types based on Drizzle table structure - compatible with existing SchemaForm component

- **CRUD Configuration**: Settings that map a Drizzle table to CRUD operations, including table name, primary key field, display columns for list view, and search fields

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can view a list of records from any demo table (users, transactions, goods) within 1 second of page load
- **SC-002**: Users can create a new record by filling out an auto-generated form and clicking save, with the record appearing in the list within 2 seconds
- **SC-003**: Users can edit an existing record and see changes reflected in the list view immediately after save
- **SC-004**: 100% of Drizzle column types used in demo tables are correctly mapped to appropriate form field types
- **SC-005**: Form validation catches 100% of constraint violations (required fields, unique constraints, format rules) before database submission
- **SC-006**: Users can successfully complete all CRUD operations (Create, Read, Update, Delete) on all demo tables without errors in happy path scenarios
- **SC-007**: Demo pages display meaningful error messages for all common error scenarios (validation failures, database errors, missing records)
- **SC-008**: Pagination controls allow users to navigate through lists of 100+ records with page load times under 1 second per page
- **SC-009**: Auto-generated forms are visually consistent with existing Schema-Driven Form examples and follow the same layout patterns
