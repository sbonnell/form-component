# Data Model: Schema-Driven Form Component V1

**Feature**: 001-schema-driven-form  
**Date**: 2025-11-08  
**Status**: Complete

## Overview

This document defines the core data entities, their relationships, validation rules, and state transitions for the Schema-Driven Form Component.

---

## 1. FormSchema

**Description**: The root JSON Schema 2020-12 document with custom extensions that fully defines a form's structure, behavior, and presentation.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `$schema` | string | Yes | JSON Schema version URI (2020-12) |
| `meta` | FormMeta | Yes | Form metadata and configuration |
| `type` | "object" | Yes | Must be "object" for root schema |
| `properties` | Record<string, FieldDefinition> | Yes | Field definitions keyed by field name |
| `required` | string[] | No | Array of required field keys |
| `allOf/if/then/else` | JSONSchemaConditional[] | No | Native JSON Schema conditionals |
| `ui` | UIConfiguration | No | Global UI configuration |
| `logic` | LogicConfiguration | No | Conditional and calculated field rules |
| `dataSources` | DataSourceConfiguration | No | Callback declarations for data loading |
| `uploads` | UploadConfiguration | No | File upload constraints |
| `layout` | LayoutConfiguration | No | Layout and navigation structure |

### Validation Rules

- `meta.id` must be unique within organization
- `meta.version` must follow semver format
- `meta.mode` must be "create" or "edit"
- All fields referenced in `required` must exist in `properties`
- Conditional rules must reference valid field paths
- Layout references must point to existing fields

### Relationships

- Contains multiple `FieldDefinition` entities
- References `DataSource` entities by name
- Contains `LayoutSection` entities
- Contains `ConditionalRule` entities

### State Transitions

```
Draft → Validated → Active → Deprecated
```

- **Draft**: Schema is being authored
- **Validated**: Schema passes JSON Schema + custom validation
- **Active**: Schema is deployed and in use
- **Deprecated**: Replaced by newer version, read-only access

---

## 2. FormMeta

**Description**: Metadata about the form schema itself.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique schema identifier |
| `version` | string | Yes | Semver version (e.g., "1.2.0") |
| `title` | string | Yes | Human-readable form title |
| `mode` | "create" \| "edit" | Yes | Form operation mode |
| `description` | string | No | Form purpose description |
| `createdAt` | ISO8601 string | No | Schema creation timestamp |
| `updatedAt` | ISO8601 string | No | Last schema update timestamp |

### Validation Rules

- `id` matches pattern: `^[a-z][a-z0-9-]+$` (kebab-case)
- `version` matches semver: `^\d+\.\d+\.\d+$`
- `mode` is exactly "create" or "edit"

---

## 3. FieldDefinition

**Description**: Defines a single form field with validation, UI hints, and behavior.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | FieldType | Yes | Data type: string, number, boolean, object, array |
| `title` | string | Yes | Field label displayed to user |
| `description` | string | No | Help text or tooltip content |
| `default` | any | No | Default value when creating new form |
| `enum` | any[] | No | Allowed values for the field |
| `format` | string | No | Format hint: email, date, time, uri, etc. |
| `pattern` | string | No | Regex pattern for string validation |
| `minLength` | number | No | Minimum string length |
| `maxLength` | number | No | Maximum string length |
| `minimum` | number | No | Minimum numeric value (inclusive) |
| `maximum` | number | No | Maximum numeric value (inclusive) |
| `exclusiveMinimum` | number | No | Minimum numeric value (exclusive) |
| `exclusiveMaximum` | number | No | Maximum numeric value (exclusive) |
| `readOnly` | boolean | No | Whether field is read-only |
| `ui` | FieldUIConfiguration | No | UI-specific configuration |
| `properties` | Record<string, FieldDefinition> | No | Nested object fields |
| `items` | FieldDefinition | No | Array item schema |

### Validation Rules

- `type` must be valid JSON Schema type
- `pattern` must be valid JavaScript regex
- `minimum` ≤ `maximum` if both specified
- `minLength` ≤ `maxLength` if both specified
- `enum` values must match field `type`
- Nested `properties` only valid when `type: "object"`
- `items` only valid when `type: "array"`

### Relationships

- Parent: `FormSchema.properties` or nested `FieldDefinition.properties`
- Contains nested `FieldDefinition` for objects/arrays
- Referenced by `ConditionalRule` entities
- Referenced by `CalculatedField` entities

---

## 4. FieldUIConfiguration

**Description**: UI-specific presentation and behavior hints for a field.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `widget` | WidgetType | No | UI widget type (text, select, date, etc.) |
| `placeholder` | string | No | Placeholder text |
| `help` | string | No | Additional help text below field |
| `width` | 1-12 | No | Grid column span (12-column grid) |
| `order` | number | No | Display order within section |
| `mask` | string | No | Input mask pattern (for masked inputs) |
| `currency` | string | No | Currency code for currency fields (ISO 4217) |
| `decimalScale` | number | No | Decimal places for numbers/currency |
| `thousandSeparator` | string | No | Thousand separator character |
| `hiddenWhen` | ConditionalRule | No | Condition to hide field |
| `requiredWhen` | ConditionalRule | No | Condition to make field required |
| `readOnlyWhen` | ConditionalRule | No | Condition to make field read-only |
| `optionsSource` | string | No | Data source name for select options |
| `dependsOn` | string[] | No | Field keys this field depends on |
| `upload` | UploadFieldConfig | No | Upload configuration for file fields |

### Validation Rules

- `width` must be 1-12 inclusive
- `widget` must match field `type` compatibility
- `mask` patterns must be valid for chosen mask type
- `currency` must be valid ISO 4217 code
- `optionsSource` must reference declared data source
- `dependsOn` fields must exist in schema

### Widget Type Compatibility

| Field Type | Compatible Widgets |
|------------|-------------------|
| string | text, textarea, masked, select, radio |
| number | number, currency, select |
| boolean | checkbox, toggle, radio |
| array | multiselect, file, array |
| object | object (nested fields) |

---

## 5. ConditionalRule

**Description**: Rule for conditional field behavior (visibility, required state, read-only state).

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `field` | string | Yes | Field path to evaluate (supports dot-notation) |
| `operator` | ConditionOperator | Yes | Comparison operator |
| `value` | any | Depends | Comparison value (required for most operators) |
| `and` | ConditionalRule[] | No | All sub-rules must be true (AND logic) |
| `or` | ConditionalRule[] | No | Any sub-rule must be true (OR logic) |

### Operators

| Operator | Description | Value Required |
|----------|-------------|----------------|
| `equals` | Field value equals comparison value | Yes |
| `notEquals` | Field value does not equal comparison value | Yes |
| `in` | Field value is in array of values | Yes (array) |
| `notIn` | Field value is not in array of values | Yes (array) |
| `greaterThan` | Field value > comparison value | Yes (number) |
| `greaterThanOrEqual` | Field value ≥ comparison value | Yes (number) |
| `lessThan` | Field value < comparison value | Yes (number) |
| `lessThanOrEqual` | Field value ≤ comparison value | Yes (number) |
| `isEmpty` | Field value is empty/null/undefined | No |
| `isNotEmpty` | Field value is not empty/null/undefined | No |

### Validation Rules

- `field` must reference existing field in schema
- Operator-appropriate `value` type (e.g., array for `in`, number for `greaterThan`)
- Cannot have both `and` and `or` in same rule
- Nested rules cannot create circular dependencies

### Evaluation

Rules are evaluated whenever referenced field values change. Evaluation is memoized to prevent redundant computation.

---

## 6. CalculatedField

**Description**: Read-only field whose value is computed from other field values.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `target` | string | Yes | Field path where result is stored |
| `dependsOn` | string[] | Yes | Field paths used in formula |
| `formula` | string | Yes | JavaScript-like expression string |

### Validation Rules

- `target` must be a field marked `readOnly: true`
- `dependsOn` fields must exist in schema
- `formula` must parse to valid AST (no eval/Function)
- Cannot create circular dependencies with other calculated fields

### Supported Formula Syntax

- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Logical: `||`, `&&`, `!`
- Comparison: `>`, `<`, `>=`, `<=`, `==`, `!=`
- Grouping: `()`
- Field references: `values.fieldName` or `values['field.nested']`
- Null coalescing: `values.optional || 0`

### Example Formulas

```javascript
"(values.fees || 0) * 0.9"                          // Apply 10% discount
"values.startDate && values.endDate ? 
  (values.endDate - values.startDate) / 86400000 : 0" // Days between dates
"values.quantity * values.pricePerUnit"              // Total price
```

### State Transitions

```
Declared → Parsed (AST) → Validated → Active
```

- Recomputes when any `dependsOn` field changes
- Debounced 100ms to batch rapid changes
- Evaluated before form submission

---

## 7. DataSource

**Description**: Named callback declaration for loading initial data or dynamic options.

### Types

#### OnLoad (Initial Data)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Callback identifier |
| `type` | "onLoad" | Yes | Data source type |

**Callback Signature**:
```typescript
function onLoad(params: {
  schemaMeta: FormMeta;
  context: CallbackContext;
}): Promise<{
  initialData: Record<string, any>;
  meta?: Record<string, any>;
}>
```

#### Options (Dynamic Selects)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Callback identifier |
| `type` | "options" | Yes | Data source type |

**Callback Signature**:
```typescript
function onOptions(params: {
  name: string;
  query: string;
  dependsOn: Record<string, any>;
  pageToken?: string;
  context: CallbackContext;
}): Promise<{
  options: Array<{ value: any; label: string; disabled?: boolean }>;
  nextPageToken?: string;
}>
```

### Validation Rules

- `name` must be unique within schema
- Referenced by field `ui.optionsSource` must match declared name
- Callback functions provided by consumer application

---

## 8. UploadConstraint

**Description**: Configuration for file upload fields.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `callback` | string | Yes | Upload callback name |
| `maxFiles` | number | No | Maximum files allowed (default: 5) |
| `maxSizeMB` | number | No | Maximum size per file in MB (default: 10) |
| `accept` | string[] | No | Allowed MIME types (default: PDF, CSV, XLS, XLSX, PNG, JPG, JPEG) |

### Validation Rules

- `maxFiles` must be ≥ 1
- `maxSizeMB` must be > 0
- `accept` values must be valid MIME types or file extensions

**Callback Signature**:
```typescript
function onUpload(params: {
  fieldKey: string;
  files: Array<{ name: string; size: number; type: string }>;
  context: CallbackContext;
}): Promise<{
  files: Array<{
    fileId: string;
    url: string;
    name: string;
    size: number;
    mimeType: string;
    checksum: string;
  }>;
}>
```

---

## 9. LayoutSection

**Description**: Defines form layout and navigation structure.

### Types

#### Grid Layout

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | "grid" | Yes | Layout type |
| `rows` | GridRow[] | Yes | Array of row definitions |

**GridRow**:
```typescript
{
  fields: Array<{ field: string; width: 1-12 }>;
}
```

#### Group/Fieldset

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | "group" | Yes | Layout type |
| `title` | string | No | Group heading |
| `description` | string | No | Group description |
| `fields` | string[] | Yes | Field keys in this group |

#### Tabs

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | "tabs" | Yes | Layout type |
| `tabs` | Tab[] | Yes | Array of tab definitions |

**Tab**:
```typescript
{
  title: string;
  fields: string[];
  icon?: string;
}
```

#### Wizard/Stepper

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | "wizard" | Yes | Layout type |
| `steps` | Step[] | Yes | Array of step definitions |

**Step**:
```typescript
{
  title: string;
  description?: string;
  fields: string[];
}
```

### Validation Rules

- All referenced `field` keys must exist in schema `properties`
- Grid row widths should sum to ≤ 12 per row
- Tab/step fields must not overlap (each field in exactly one tab/step)
- At least one layout section must contain all schema fields

---

## 10. FormState

**Description**: Runtime state of an active form instance (not persisted in schema).

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `values` | Record<string, any> | Current field values |
| `errors` | Record<string, string> | Validation error messages by field path |
| `touched` | Record<string, boolean> | Whether user has interacted with field |
| `dirty` | Record<string, boolean> | Whether field has changed from initial value |
| `isSubmitting` | boolean | Whether form is currently submitting |
| `isValidating` | boolean | Whether validation is in progress |
| `submitCount` | number | Number of submit attempts |
| `initialValues` | Record<string, any> | Values loaded from onLoad or prop |

### State Transitions

```
Initializing → Ready → Editing → Validating → Submitting → Success/Error
                 ↑                               ↓
                 └───────────────────────────────┘
```

- **Initializing**: Loading schema and initial data
- **Ready**: Form rendered, awaiting user input
- **Editing**: User is modifying field values
- **Validating**: Running validation rules (on blur, change, or submit)
- **Submitting**: Calling onSubmit callback
- **Success**: Submission succeeded
- **Error**: Validation or submission failed

---

## 11. CallbackContext

**Description**: Context information passed to all callback functions.

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | Current user identifier |
| `locale` | string | Yes | User's locale (e.g., "en-GB") |
| `correlationId` | string | Yes | Unique request ID for tracing |
| `timestamp` | ISO8601 string | Yes | Request timestamp |
| `formMode` | "create" \| "edit" | Yes | Current form mode |
| `sessionId` | string | No | User session identifier |

### Usage

Included in all callback invocations for telemetry, audit logging, and context-aware behavior.

---

## 12. OptionCache

**Description**: Session-scoped cache for remote option results.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `key` | string | Cache key: `{sourceName}:{query}:{JSON.stringify(dependsOn)}` |
| `options` | Option[] | Cached option results |
| `timestamp` | number | Cache entry creation time (ms since epoch) |
| `ttl` | number | Time-to-live in milliseconds (default: 600000 = 10 minutes) |

### Validation Rules

- Entries expire after `ttl` milliseconds
- Cache cleared on schema `cacheKey` change
- Cache cleared on component unmount (session-only)

### Cache Invalidation

- Automatic: TTL expiration
- Manual: Schema `cacheKey` field change forces cache bust
- Session boundary: All caches cleared on page refresh/navigate away

---

## 13. ChangeTracker

**Description**: Tracks which fields have been modified for audit purposes.

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `dirtyFields` | Record<string, boolean> | Map of changed field paths |
| `initialSnapshot` | Record<string, any> | Deep copy of initial values |

### Behavior

- On form initialization, store deep clone of initial values
- On field change, deep compare current value to initial value
- Mark field path as dirty if values differ
- Include dirty field map in submission callback

### Comparison Rules

- Primitives: `!==` comparison
- Objects: Recursive deep equality check
- Arrays: Length + element-wise deep equality
- Dates: Compare timestamp values
- Null/undefined: Considered equal only to themselves

---

## Relationships Diagram

```
FormSchema
  ├─ contains ──> FormMeta (1:1)
  ├─ contains ──> FieldDefinition[] (1:N)
  ├─ references ─> DataSource[] (1:N)
  ├─ contains ──> LayoutSection[] (1:N)
  └─ contains ──> ConditionalRule[] (1:N)

FieldDefinition
  ├─ contains ──> FieldUIConfiguration (1:1)
  ├─ contains ──> FieldDefinition[] (1:N, nested)
  ├─ referenced by ─> ConditionalRule (N:N)
  └─ referenced by ─> CalculatedField (N:N)

FormState (runtime)
  ├─ initialized from ─> FormSchema (1:1)
  ├─ populated by ──────> DataSource.onLoad (1:1)
  ├─ validated by ──────> FieldDefinition rules (1:N)
  └─ tracked by ────────> ChangeTracker (1:1)
```

---

## Validation Summary

| Entity | Key Validations |
|--------|----------------|
| FormSchema | Valid JSON Schema 2020-12, all references exist, no circular dependencies |
| FieldDefinition | Type-appropriate constraints, valid regex patterns, nested structure coherent |
| ConditionalRule | Field references exist, operator matches value type, no circular logic |
| CalculatedField | Parse-safe formula, dependencies exist, no circular calculations |
| LayoutSection | All field references exist, no overlaps in tabs/steps |
| UploadConstraint | Positive limits, valid MIME types |
| FormState | Type-safe values per schema, all required fields present before submit |

---

## Example Data Flow

### Form Initialization (Edit Mode)

1. Consumer provides `FormSchema` + optional initial data prop
2. Component validates schema structure
3. If `dataSources.onLoad` declared:
   - Call `onLoad({ schemaMeta, context })`
   - Merge returned `initialData` with prop data (prop takes precedence)
4. Initialize `FormState.values` and `FormState.initialValues`
5. Parse schema to Zod validation schema
6. Identify calculated fields and build dependency graph
7. Render form with initial values

### User Interaction

1. User modifies field value
2. Update `FormState.values[fieldPath]`
3. Mark `FormState.touched[fieldPath] = true`
4. Re-evaluate conditional rules referencing this field
5. Show/hide or require/unrequire dependent fields
6. If field is dependency of calculated field:
   - Debounce 100ms
   - Recompute calculated field formula
   - Update calculated field display value
7. On blur: run field-level validation
8. Update `FormState.errors` if validation fails

### Form Submission

1. User clicks Submit
2. Set `FormState.isValidating = true`
3. Run all field validations (Zod schema)
4. Re-evaluate all conditional rules
5. Recompute all calculated fields
6. If validation fails:
   - Set `FormState.errors` with all error messages
   - Show global error banner
   - Focus first invalid field
   - Exit submission
7. If validation passes:
   - Compute `dirtyFields` from ChangeTracker
   - Call `onBeforeSubmit` hook if provided
   - Set `FormState.isSubmitting = true`
   - Call `onSubmit({ rawData: values, changedFields: dirtyFields, schemaMeta, context })`
   - If success: call `onAfterSubmit` hook, show success message
   - If failure: map `fieldErrors` to `FormState.errors`, show global error
8. Set `FormState.isSubmitting = false`

---

## Performance Considerations

- **Schema Parsing**: Cached per schema ID + version (parse once, reuse)
- **Zod Schema Generation**: Memoized, regenerated only on schema change
- **Conditional Evaluation**: Memoized by rule + value hash
- **Calculated Fields**: Debounced 100ms, only recompute when dependencies change
- **Option Caching**: 10-minute TTL, keyed by source + query + dependencies
- **Field Subscriptions**: React Hook Form isolates re-renders to changed fields only
- **Large Option Lists**: Virtualized rendering for lists >100 items

---

## Security Considerations

- **Formula Evaluation**: No `eval()` or `new Function()` - AST parsing only
- **Conditional Rules**: Predefined operators only, no arbitrary code execution
- **File Uploads**: Client-side validation only - server must re-validate and scan
- **Schema Injection**: Schema treated as configuration, not executable code
- **Callback Context**: Includes `correlationId` for audit trail of all operations
