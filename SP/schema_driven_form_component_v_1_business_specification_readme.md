# Schema‑Driven Form Component — V1 Business Specification & README

## 1) Purpose & Vision
A single Next.js component renders **create** and **edit** forms from a **JSON schema**. The schema fully defines fields, data types, validation, conditional logic, dynamic option sources, file‑upload constraints, and layout. The component is used internally by a 300‑person financial firm across multiple teams (Ops, Finance, Risk, IT) to standardize data capture while remaining flexible.

---

## 2) In Scope (V1)
- **Schema‑first rendering** using an industry JSON Schema dialect.
- **Modes:** Create and Edit handled by the same component.
- **Field Catalog:**
  - Text, Textarea, Number, Currency, Date, Time, DateTime, Select, Multi‑select, Radio, Checkbox, Toggle/Switch, File Upload, Array/Repeater, Nested Object, Masked Input, Calculated/Read‑only.
- **Validation:** Field‑level rules only (required, min/max, pattern, format). Inline messages displayed near the field.
- **Conditional Logic:** Show/hide and require/unrequire based on other field values.
- **Dynamic Data:** Remote options for selects/multiselects with search, debounce, pagination, and dependent options.
- **Callbacks:** Submission, data sources, and uploads defined by name in the schema.
- **Layout:** Grid (rows/columns), groups/fieldsets, tabs, accordion, and stepper/wizard.
- **Non‑functional:** Modern browsers only; responsive desktop‑first layout.

## 3) Out of Scope (V1)
- Cross‑field business validation rules (to be introduced in V2).
- Field‑level permissions/role‑based visibility (V2).
- Offline mode, drafts/auto‑save (V2 consideration).

---

## 4) Users & Usage Context
- Internal staff capturing client, account, trade, and incident data.
- Forms may be embedded inside operational dashboards or standalone pages.
- Accessibility: Keyboard‑friendly, screen‑reader labels, focus management.

---

## 5) Non‑Functional Requirements
- **Performance targets:**
  - Render: ≤ 1.2s for forms up to **75 fields**, shallow nesting (≤ 3 levels).
  - Submit: ≤ 2.0s round‑trip for typical network conditions.
- **Scalability:** Support forms up to **100 fields** without noticeable lag.
- **Availability:** Component should degrade gracefully if remote option sources fail (show message + retry control).
- **Security & Privacy:**
  - No sensitive data persisted client‑side beyond session memory.
  - Uploads routed via firm‑approved endpoints; temporary URLs only.
- **Browser support:** Modern evergreen browsers (Chromium, Firefox, Safari) at current‑1 versions.
- **Internationalization:** V1 uses literal strings; schema can optionally include i18n keys for future expansion.
- **Accessibility target:** WCAG 2.1 AA intent in labels, errors, and focus order.

---

## 6) Schema Dialect & High‑Level Shape
- **Dialect:** JSON Schema **2020‑12** for data definitions and validation.
- **Separation of concerns:**
  - **`$schema`, `type`, `properties`, `required`**: canonical data definitions.
  - **`ui`**: UI hints (widgets, placeholders, help text, widths, visibility).
  - **`logic`**: conditionals, calculated fields, dependencies.
  - **`dataSources`**: named, schema‑declared callbacks for initial data and option endpoints.
  - **`uploads`**: per‑field constraints and upload callback mapping.
  - **`layout`**: grid, groups/fieldsets, tabs, steps with ordering.

### 6.1 Top‑Level Keys (Required/Optional)
- `meta` (req): `{ id, version, title, mode }` where `mode ∈ {"create","edit"}`.
- `type` (req): must be `"object"` for root.
- `properties` (req): JSON Schema field definitions.
- `required` (opt): array of required field keys.
- `allOf/if/then/else` (opt): native JSON Schema structures for basic conditionals.
- `ui` (opt): per‑field widget configuration and layout spans.
- `logic` (opt): custom rules not covered by native JSON Schema.
- `dataSources` (opt): named lookups and initial‑data callbacks.
- `uploads` (opt): upload routing and constraints.
- `layout` (opt): sections, groups, grid, tabs, steps.

### 6.2 Field Types & Standard Options
For each field in `properties`: common attributes include `title`, `description`, `type`, `format`, `pattern`, `minimum/maximum`, `enum`, `default`, `readOnly`.

**Widget hints (`ui` per field):** `{ widget, placeholder, help, width, order, mask, currency, decimalScale, thousandSeparator, readOnlyWhen, hiddenWhen }`.

**Examples of `widget` values:** `"text" | "textarea" | "number" | "currency" | "date" | "time" | "datetime" | "select" | "multiselect" | "radio" | "checkbox" | "toggle" | "file" | "array" | "object" | "masked" | "calculated"`.

---

## 7) Conditional Logic & Dynamics (V1 Behavior)
- **Visibility rules:** `ui.hiddenWhen` accepts rules referencing other fields, e.g., `{ field: "hasFees", equals: true }`.
- **Requirement rules:** `ui.requiredWhen` promotes a field to required when conditions are met.
- **Dependent options:** A select may declare `dependsOn` fields; option callback receives current dependent values.
- **Re‑evaluation:** Rules re‑run on relevant field changes; calculated fields recompute on change and before submit.

---

## 8) Dynamic Options (Search, Debounce, Pagination, Caching)
- **Remote search:** Supported with debounce **300ms**.
- **Pagination:** Supported via `nextPageToken` contract.
- **Dependent options:** Supported by passing `context.values` and `dependsOn` values to the option callback.
- **Caching:** Per‑session cache keyed by `{ name, query, dependsOn }` with **TTL 10 minutes**. Manual invalidation available via a `cacheKey` change in schema.

---

## 9) File Uploads (V1 Constraints)
- **Allowed types (default):** PDF, CSV, XLS, XLSX, PNG, JPG, JPEG.
- **Max size per file:** **10 MB** (configurable per field in `uploads`).
- **Max files per field:** **5** (configurable).
- **Virus/malware scanning:** Performed server‑side by existing firm tooling (out of scope for component).
- **UX:** Show progress, cancel/retry, and post‑upload file list with remove option.

**Upload return shape (per file):** `{ fileId, url, name, size, mimeType, checksum }`.

---

## 10) Masked & Formatted Inputs
- **Masks supported:** IBAN, UK sort code, account number, UK postcode, phone (E.164), generic numeric masks.
- **Currency & numbers:** Fixed **en‑GB** format (period decimal, comma thousands). Currency fields capture **numeric value** plus an optional `currencyCode` when declared.

---

## 11) Calculated & Read‑Only Fields
- **Client‑side formulas:** Declared under `logic.calculated` with dependencies; pure computations only in V1 (no server lookups).
- **Recompute:** On change of dependencies and before submit.
- **Read‑only:** Marked via `readOnly: true` or `ui.readOnlyWhen` rules.

---

## 12) Error Handling & Messaging
- **Inline messages:** Shown beneath/next to fields.
- **Global message (standardized copy):** “We couldn’t save your changes. Please review the highlighted fields.”
- **Server error mapping:** On submit failure, a `fieldErrors` map is accepted to target fields precisely.
- **Recoverable vs fatal:** Fatal errors display a non‑dismissible banner and do not mutate form state.

---

## 13) Save Flow & Editing Model
- **Initial data:**
  - May be provided as a **prop** (for edit mode) and/or
  - Retrieved via a schema‑declared **`onLoad`** data source.
- **Change tracking:** Component computes a **dirty fields map**; submit callback receives both raw values and changed fields for audit.
- **V1 save model:** **Submit only** (no drafts/auto‑save). Optional manual **Reset** reverts to initial values.

---

## 14) Layout & Navigation
- **Grid:** 12‑column responsive grid; per‑field `ui.width` accepts 1–12.
- **Groups/Fieldsets:** Optional titles and descriptions.
- **Tabs:** Logical partitioning of fields; validation spans all tabs.
- **Wizard/Steps:** Sequential steps with per‑step validation gates; final submit occurs on last step.

---

## 15) Callback Contracts (Business Interfaces)
> Names are referenced by the schema; actual endpoints/runtimes are owned by the consuming application.

### 15.1 onLoad (Initial Data)
**When:** Before initial render in edit mode, or on demand if declared.

**Input:** `{ schemaMeta, context }`
- `schemaMeta`: `{ id, version, mode }`
- `context`: `{ userId, locale, correlationId }`

**Output:** `{ initialData, meta? }`
- `initialData`: object keyed by field names.
- `meta` (optional): freeform object for downstream callbacks.

### 15.2 onOptions (Remote Options)
**When:** For selects/multiselects, on open/type/scroll.

**Input:** `{ name, query, dependsOn, pageToken?, context }`
- `name`: option source name (declared in schema).
- `query`: current search string.
- `dependsOn`: `{ [fieldKey]: value }` subset.
- `pageToken`: opaque string for pagination.

**Output:** `{ options, nextPageToken? }`
- `options`: array of `{ value, label, disabled? }`.
- `nextPageToken`: if more results exist.

### 15.3 onUpload (File Upload)
**When:** User selects files for an upload field.

**Input:** `{ fieldKey, files: [{ name, size, type }], context }`

**Output:** `{ files: [{ fileId, url, name, size, mimeType, checksum }] }`

### 15.4 onSubmit (Form Submission)
**When:** User submits the form.

**Input:** `{ rawData, changedFields, schemaMeta, context }`
- `rawData`: object of all current values (no transformations).
- `changedFields`: keys changed from initial data (Boolean map or list).
- `schemaMeta`: `{ id, version, mode }`.
- `context`: `{ userId, locale, correlationId }`.

**Output (success):** `{ ok: true, id?, message? }`

**Output (failure):** `{ ok: false, message, fieldErrors? }`
- `fieldErrors`: `{ [fieldPath]: message }` using dot‑notation for nested fields.

### 15.5 Lifecycle Hooks (Optional)
- `onBeforeSubmit(rawData, context) → { rawData } | throws` (client‑side transform/stop).
- `onAfterSubmit(result, context)` (toast, redirect, analytics).

---

## 16) Schema Snippet (Illustrative)
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "meta": { "id": "client-onboard", "version": "1.0.0", "title": "Client Onboarding", "mode": "create" },
  "type": "object",
  "required": ["clientName", "country", "contact"],
  "properties": {
    "clientName": { "type": "string", "title": "Client Name", "minLength": 2 },
    "country": { "type": "string", "title": "Country", "ui": { "widget": "select", "optionsSource": "countries" } },
    "contact": {
      "type": "object",
      "title": "Primary Contact",
      "required": ["email"],
      "properties": {
        "email": { "type": "string", "format": "email", "title": "Email" },
        "phone": { "type": "string", "title": "Phone", "ui": { "widget": "masked", "mask": "+{44} 00 0000 0000" } }
      }
    },
    "documents": {
      "type": "array",
      "title": "Supporting Documents",
      "items": { "type": "string" },
      "ui": { "widget": "file", "upload": { "callback": "uploadDocs", "maxFiles": 5, "maxSizeMB": 10, "accept": ["application/pdf"] } }
    },
    "hasFees": { "type": "boolean", "title": "Include Fees?", "ui": { "widget": "toggle" } },
    "fees": {
      "type": "number",
      "title": "Fee Amount",
      "minimum": 0,
      "ui": { "widget": "currency", "currency": "GBP", "hiddenWhen": { "field": "hasFees", "equals": false } }
    },
    "netAmount": {
      "type": "number",
      "title": "Net Amount",
      "readOnly": true,
      "ui": { "widget": "calculated" }
    }
  },
  "logic": {
    "calculated": [
      { "target": "netAmount", "dependsOn": ["fees"], "formula": "(values.fees || 0) * 0.9" }
    ]
  },
  "dataSources": {
    "onLoad": { "name": "loadClient" },
    "options": [ { "name": "countries" } ]
  },
  "layout": {
    "grid": [
      { "row": [ { "field": "clientName", "width": 8 }, { "field": "country", "width": 4 } ] },
      { "row": [ { "field": "contact.email", "width": 6 }, { "field": "contact.phone", "width": 6 } ] },
      { "group": { "title": "Fees", "items": ["hasFees", "fees", "netAmount"] } }
    ],
    "tabs": [ { "title": "Main", "fields": ["clientName", "country", "contact"] }, { "title": "Documents", "fields": ["documents"] } ]
  },
  "uploads": { "uploadDocs": { "maxFiles": 5, "maxSizeMB": 10, "accept": ["application/pdf"] } }
}
```
*(Snippet is illustrative of shapes/keys expected by the component; actual implementation details are out of scope for this document.)*

---

## 17) Validation Messages (Standard Copy)
- Required: “This field is required.”
- Pattern: “Please match the requested format.”
- Min/Max: “Value is out of range.”
- Format (email, date): “Please enter a valid value.”

---

## 18) Operational Considerations
- **Monitoring:** Log `correlationId`, schema `id/version`, and outcome (`ok`, latency buckets) in client telemetry.
- **Change management:** Schema versions are immutable once deployed; new changes require a new `version`.
- **Backwards compatibility:** Consumers should tolerate additive changes (new optional fields, enum expansions).

---

## 19) V2 Backlog (Not in V1)
- Cross‑field and cross‑step validation rules (e.g., startDate ≤ endDate).
- Field‑level permissions/visibility based on roles and data sensitivity.
- Drafts/auto‑save, offline resilience.
- Server‑assisted calculated fields (e.g., indicative FX rate lookup).
- Full i18n with message catalogs.

---

# README.md (for IT Department)

## Overview
This component renders data‑entry forms from a JSON schema (JSON Schema 2020‑12 plus UI/logic extensions). It standardizes how internal teams define and deliver forms without custom builds.

## How It’s Consumed (High‑Level)
- Product teams author a schema (see Section 6/16) and register callback names for load, options, upload, and submit.
- Applications supply the callback implementations appropriate to their domain.
- The component accepts **initial data** via prop or via the `onLoad` callback declared in the schema.

## Callback Contracts (Summary)
- **onLoad**: `{ schemaMeta, context } → { initialData, meta? }`
- **onOptions**: `{ name, query, dependsOn, pageToken?, context } → { options, nextPageToken? }`
- **onUpload**: `{ fieldKey, files[], context } → { files: [{ fileId, url, name, size, mimeType, checksum }] }`
- **onSubmit**: `{ rawData, changedFields, schemaMeta, context } → { ok: true, id?, message? } | { ok: false, message, fieldErrors? }`

## Error Handling
- Inline field errors plus a standardized global message on failure.
- Server responses should supply `fieldErrors` using dot‑notation paths for nested fields.

## Security & Compliance
- No client‑side persistence of sensitive data beyond active session.
- File uploads must route through approved internal endpoints with scanning.
- Ensure PII handling follows internal policies; masking patterns available in schema.

## Performance Targets
- Render ≤ 1.2s for ≤ 75 fields; Submit ≤ 2.0s.

## Browser Support
- Modern evergreen (current‑1) versions of Chromium, Firefox, Safari.

## Accessibility
- Aim for WCAG 2.1 AA; ensure labels, descriptions, and error text are provided by schema.

## Change Control
- Schema `id` and `version` are mandatory. New changes should increment `version` and be deployed alongside prior versions if needed.

## Contact & Ownership
- Business owners: Ops/Risk product leads.
- Technical owners: Internal App Platform team for component lifecycle; domain teams own callback implementations.

