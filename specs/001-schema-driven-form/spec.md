# Feature Specification: Schema-Driven Form Component V1

**Feature Branch**: `001-schema-driven-form`  
**Created**: 2025-11-08  
**Status**: Draft  
**Input**: User description: "Schema-Driven Form Component V1 - A single Next.js component that renders create and edit forms from a JSON schema, supporting 75+ fields with validation, conditional logic, dynamic options, file uploads, and complex layouts for internal financial firm use"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Form Creation and Submission (Priority: P1)

An operations staff member needs to capture basic client information using a standardized form that validates data entry and ensures required fields are completed before submission.

**Why this priority**: This is the core value proposition - enabling staff to create structured data entries with validation. Without this, the component has no purpose.

**Independent Test**: Can be fully tested by loading a simple schema with 5-10 basic fields (text, number, date, select) and successfully submitting valid data while confirming validation blocks invalid submissions.

**Acceptance Scenarios**:

1. **Given** a create-mode form schema with required and optional fields, **When** user fills required fields with valid data and submits, **Then** form data is submitted successfully with all field values captured correctly
2. **Given** a form with validation rules (min/max, pattern, format), **When** user enters invalid data, **Then** inline error messages appear beneath affected fields showing specific validation failures
3. **Given** a form with missing required fields, **When** user attempts to submit, **Then** submission is blocked, required fields are highlighted, and global error message displays "We couldn't save your changes. Please review the highlighted fields."
4. **Given** a submitted form, **When** server returns field-level errors, **Then** errors are mapped to specific fields using dot-notation paths and displayed inline

---

### User Story 2 - Edit Existing Records with Change Tracking (Priority: P1)

A finance team member needs to edit existing client account details while the system tracks which fields were modified for audit purposes.

**Why this priority**: Edit mode is equally critical as create mode for operational workflows. Change tracking enables audit compliance required in financial services.

**Independent Test**: Load a form in edit mode with pre-populated data, modify 3-5 fields, submit, and verify the submission callback receives both complete data and a list of changed fields only.

**Acceptance Scenarios**:

1. **Given** an edit-mode schema with initial data provided, **When** form renders, **Then** all fields are pre-populated with initial values
2. **Given** a pre-populated form, **When** user modifies specific fields and submits, **Then** submission includes both complete current values AND a map of changed fields
3. **Given** a form loaded via onLoad callback, **When** component initializes, **Then** initial data is fetched and form populates before user interaction
4. **Given** an edited form with changes, **When** user clicks Reset, **Then** all fields revert to initial loaded values

---

### User Story 3 - Dynamic Options with Search and Dependencies (Priority: P2)

A risk analyst needs to select from large lists (e.g., 10,000+ clients) with type-ahead search, and have subsequent dropdown options filtered based on prior selections (e.g., accounts filtered by selected client).

**Why this priority**: Large option sets are common in financial firms (clients, accounts, securities). Without search and dependencies, forms become unusable for real-world data volumes.

**Independent Test**: Configure a select field with remote options callback, type search text, verify debounced API call with search query, and confirm filtered results appear. Then configure dependent select and verify child options refresh when parent changes.

**Acceptance Scenarios**:

1. **Given** a select field with remote options source, **When** user opens dropdown, **Then** options are fetched from declared callback and displayed
2. **Given** a searchable select field, **When** user types 3+ characters, **Then** options callback is invoked after 300ms debounce with search query, and matching options are displayed
3. **Given** a select with 100+ results, **When** user scrolls to bottom of dropdown, **Then** next page is fetched using nextPageToken and appended to existing options
4. **Given** a child select depending on parent select, **When** parent value changes, **Then** child options are re-fetched with new dependsOn context and child value is cleared
5. **Given** previously fetched options, **When** same query is repeated within 10 minutes, **Then** cached results are used without additional API call

---

### User Story 4 - Conditional Visibility and Required Fields (Priority: P2)

An operations user fills a form where certain fields only appear based on prior answers (e.g., "Fee Amount" only shows if "Include Fees?" is toggled on), and validation adjusts dynamically.

**Why this priority**: Conditional logic reduces form complexity and prevents data entry errors by showing only relevant fields. Common requirement across operational workflows.

**Independent Test**: Create schema with hiddenWhen and requiredWhen rules, toggle trigger field, and verify dependent fields appear/disappear and validation adjusts accordingly.

**Acceptance Scenarios**:

1. **Given** a field with hiddenWhen rule referencing another field, **When** condition is false, **Then** field is visible and editable
2. **Given** a visible conditional field, **When** trigger field changes to match hiddenWhen condition, **Then** dependent field is hidden and its value is excluded from submission
3. **Given** a field with requiredWhen rule, **When** condition becomes true, **Then** field becomes required and submission blocks if empty
4. **Given** a required conditional field, **When** trigger condition becomes false, **Then** field is no longer required and submission succeeds even if empty
5. **Given** calculated field with dependencies, **When** dependency values change, **Then** calculated value updates immediately before user interaction

---

### User Story 5 - File Upload with Constraints (Priority: P3)

A compliance officer needs to attach supporting documents (PDFs, spreadsheets) to a case record, with file type and size validation enforced before upload.

**Why this priority**: File attachments are important for documentation but not critical to MVP form functionality. Can be delivered independently once core form rendering works.

**Independent Test**: Configure file upload field with type/size constraints, attempt uploads that violate constraints, verify client-side validation blocks them, then upload valid files and confirm upload callback returns file metadata.

**Acceptance Scenarios**:

1. **Given** a file upload field with allowed types (PDF, CSV, XLS), **When** user selects a JPG file, **Then** upload is rejected with message indicating allowed types
2. **Given** a file upload field with 10MB max size, **When** user selects 12MB file, **Then** upload is blocked with size limit message
3. **Given** a valid file selection, **When** upload begins, **Then** progress indicator displays and user can cancel mid-upload
4. **Given** successful upload, **When** upload callback returns file metadata, **Then** file appears in field with name, size, and remove option
5. **Given** field with maxFiles: 5 constraint and 5 uploaded files, **When** user attempts to add 6th file, **Then** upload is blocked with message about maximum files

---

### User Story 6 - Complex Layouts (Grid, Tabs, Wizard) (Priority: P3)

A product manager designs a multi-section form spanning 75 fields organized into tabs (e.g., "Client Info", "Accounts", "Risk Profile") with logical grouping and responsive column layouts.

**Why this priority**: Layout capabilities improve UX for large forms but core validation/submission works without them. Enables complex real-world forms but can be added incrementally.

**Independent Test**: Define schema with layout section specifying tabs and grid columns, render form, and verify fields appear in correct tabs with specified column widths.

**Acceptance Scenarios**:

1. **Given** a schema with grid layout specifying row/column widths, **When** form renders, **Then** fields are arranged in specified columns respecting 12-column grid
2. **Given** a schema with tabs configuration, **When** form renders, **Then** fields are distributed across tabs with correct tab titles
3. **Given** a tabbed form with validation errors on multiple tabs, **When** user submits, **Then** all errors across all tabs are validated and error indicators appear on affected tab headers
4. **Given** a wizard/stepper layout with 3 steps, **When** user completes step 1 and clicks Next, **Then** step 1 fields are validated before advancing to step 2
5. **Given** a wizard on final step, **When** user clicks Submit, **Then** all steps are validated and submission occurs only if entire form is valid

---

### User Story 7 - Masked and Formatted Input (Priority: P3)

A finance user enters formatted data like UK postcodes, IBANs, and currency amounts with automatic formatting applied as they type, ensuring data consistency.

**Why this priority**: Formatting improves data quality and UX but forms function without it using plain text fields. Valuable enhancement for financial data entry.

**Independent Test**: Configure fields with mask patterns (IBAN, postcode, currency), type unformatted values, and verify formatting is applied automatically and submitted value is correctly parsed.

**Acceptance Scenarios**:

1. **Given** a masked input field with IBAN pattern, **When** user types characters, **Then** formatting is applied automatically as they type (spaces inserted at correct positions)
2. **Given** a currency field with en-GB format, **When** user enters "1234.56", **Then** display shows "1,234.56" with comma thousand separator and period decimal
3. **Given** a phone field with E.164 mask, **When** user types digits, **Then** country code prefix and spacing are applied automatically
4. **Given** a masked field, **When** form submits, **Then** unmasked/parsed value is submitted (numeric value for currency, clean string for IBAN)

---

### Edge Cases

- What happens when remote options callback fails or times out? System should display user-friendly error message in dropdown with retry button, allowing form to remain functional for other fields.
- How does system handle very large schemas (100 fields at upper limit)? Form should remain responsive with render time under 1.2s through lazy rendering or virtualization of off-screen fields.
- What happens when user edits field while calculated field is recomputing? Recomputation should be debounced to prevent race conditions, with latest values always used.
- How does system handle invalid initial data from onLoad callback? Validation should run on initial load and display errors for invalid pre-populated fields, allowing user to correct them.
- What happens when user navigates away with unsaved changes? System displays confirmation dialog warning user about unsaved changes before allowing navigation, preventing accidental data loss through browser navigation interception.
- How does system handle schema version mismatches between frontend component and backend? Component attempts graceful degradation by using supported features and ignoring unknown features while logging warnings, allowing some functionality to work even with minor schema incompatibilities.
- What happens when dependent options callback returns empty results? Display "No options available" message in dropdown and allow user to clear selection to trigger different parent value.
- How does system handle file uploads that pass client validation but fail server-side virus scanning? Server should return file-specific error in upload callback response, component displays error for that file and allows removal/retry.

## Requirements *(mandatory)*

### Functional Requirements

#### Core Form Rendering
- **FR-001**: System MUST render forms in both "create" and "edit" modes from a single component instance
- **FR-002**: System MUST support JSON Schema 2020-12 dialect for data definitions and validation
- **FR-003**: System MUST support forms with up to 100 fields without noticeable performance degradation
- **FR-004**: System MUST render forms within 1.2 seconds for forms up to 75 fields with shallow nesting (≤3 levels)
- **FR-005**: System MUST support responsive desktop-first layout compatible with modern evergreen browsers (Chromium, Firefox, Safari at current-1 versions)

#### Field Types
- **FR-006**: System MUST support text, textarea, number, currency, date, time, datetime input fields
- **FR-007**: System MUST support select, multi-select, radio, checkbox, toggle/switch selection fields
- **FR-008**: System MUST support file upload, array/repeater, nested object, masked input, and calculated/read-only field types
- **FR-009**: System MUST support custom widget hints via ui configuration for each field type
- **FR-010**: System MUST support masked inputs for IBAN, UK sort code, account number, UK postcode, phone (E.164), and generic numeric masks
- **FR-011**: Currency fields MUST capture numeric value with fixed en-GB formatting (period decimal, comma thousands separator)

#### Validation
- **FR-012**: System MUST enforce field-level validation rules: required, min/max length, min/max value, pattern, format
- **FR-013**: System MUST display inline validation messages beneath or next to each field
- **FR-014**: System MUST display global error message "We couldn't save your changes. Please review the highlighted fields." when submission fails
- **FR-015**: System MUST accept server-side fieldErrors map using dot-notation for nested fields and display errors inline
- **FR-016**: System MUST validate all fields across all layout sections (tabs, steps) before allowing submission
- **FR-017**: System MUST distinguish between recoverable validation errors (inline messages) and fatal errors (non-dismissible banner)

#### Conditional Logic
- **FR-018**: System MUST support hiddenWhen rules to show/hide fields based on other field values
- **FR-019**: System MUST support requiredWhen rules to dynamically enforce required validation based on conditions
- **FR-020**: System MUST support readOnlyWhen rules to conditionally make fields read-only
- **FR-021**: System MUST re-evaluate conditional rules whenever relevant field values change
- **FR-022**: System MUST support calculated fields with dependency tracking that recompute on dependency changes and before submission
- **FR-023**: Calculated field formulas MUST be client-side pure computations only (no server lookups in V1)

#### Dynamic Options
- **FR-024**: System MUST support remote option sources for select and multi-select fields via declared callbacks
- **FR-025**: System MUST support searchable selects with 300ms debounce on user input
- **FR-026**: System MUST support paginated option results via nextPageToken contract
- **FR-027**: System MUST support dependent options where child select options are filtered based on parent field values
- **FR-028**: System MUST cache option results per-session with 10-minute TTL, keyed by {name, query, dependsOn values}
- **FR-029**: System MUST support manual cache invalidation via cacheKey change in schema
- **FR-030**: System MUST handle option callback failures gracefully with user-friendly error message and retry control

#### File Uploads
- **FR-031**: System MUST enforce allowed file types (default: PDF, CSV, XLS, XLSX, PNG, JPG, JPEG) configurable per field
- **FR-032**: System MUST enforce maximum file size per file (default: 10MB) configurable per field
- **FR-033**: System MUST enforce maximum files per field (default: 5) configurable per field
- **FR-034**: System MUST display upload progress indicator with cancel and retry capabilities
- **FR-035**: System MUST display uploaded files list with remove option after successful upload
- **FR-036**: Upload callback MUST return file metadata: {fileId, url, name, size, mimeType, checksum}

#### Data Management
- **FR-037**: System MUST accept initial data via component prop for edit mode
- **FR-038**: System MUST fetch initial data via schema-declared onLoad callback when configured
- **FR-039**: System MUST track dirty fields (changed from initial values) and include in submission callback
- **FR-040**: System MUST provide manual Reset capability that reverts all fields to initial values
- **FR-041**: System MUST submit forms within 2.0 seconds round-trip under typical network conditions
- **FR-042**: System MUST NOT persist sensitive data client-side beyond active session memory

#### Layout & Navigation
- **FR-043**: System MUST support 12-column responsive grid layout with per-field width configuration (1-12 columns)
- **FR-044**: System MUST support groups/fieldsets with optional titles and descriptions
- **FR-045**: System MUST support tabs layout for logical field partitioning
- **FR-046**: System MUST support wizard/stepper layout with sequential steps and per-step validation gates
- **FR-047**: Wizard layout MUST validate current step before allowing navigation to next step
- **FR-048**: Wizard layout MUST validate all steps before final submission on last step

#### Accessibility
- **FR-049**: System MUST provide keyboard-friendly navigation for all interactive elements
- **FR-050**: System MUST provide screen-reader accessible labels for all form fields
- **FR-051**: System MUST manage focus order logically through form sections and fields
- **FR-052**: System MUST meet WCAG 2.1 AA intent for labels, error messages, and focus indicators

#### Callbacks & Integration
- **FR-053**: System MUST invoke onLoad callback with {schemaMeta, context} and accept {initialData, meta?} response
- **FR-054**: System MUST invoke onOptions callback with {name, query, dependsOn, pageToken?, context} and accept {options, nextPageToken?} response
- **FR-055**: System MUST invoke onUpload callback with {fieldKey, files[], context} and accept {files: [{fileId, url, name, size, mimeType, checksum}]} response
- **FR-056**: System MUST invoke onSubmit callback with {rawData, changedFields, schemaMeta, context} and accept success {ok: true, id?, message?} or failure {ok: false, message, fieldErrors?} response
- **FR-057**: System MUST support optional onBeforeSubmit hook for client-side transformation or validation blocking
- **FR-058**: System MUST support optional onAfterSubmit hook for post-submission actions (toast, redirect, analytics)
- **FR-059**: All callbacks MUST receive context object containing {userId, locale, correlationId} for telemetry and audit

#### Monitoring & Telemetry
- **FR-060**: System MUST log correlationId, schema id/version, and outcome (ok/error) in client telemetry
- **FR-061**: System MUST track render time and submission latency in performance telemetry

### Key Entities *(include if feature involves data)*

- **FormSchema**: JSON Schema 2020-12 document with extensions defining complete form structure, validation, UI hints, conditional logic, data sources, upload configuration, and layout. Contains meta {id, version, title, mode}, properties definitions, required array, ui configurations, logic rules, dataSources declarations, uploads constraints, and layout specifications.

- **FieldDefinition**: Individual field specification within schema properties. Contains type, title, description, validation rules (pattern, min/max, format), default value, readOnly flag, and optional ui hints (widget, placeholder, help, width, mask, currency settings, conditional rules).

- **ValidationRule**: Field-level constraint defined in schema. Types include required, minLength/maxLength, minimum/maximum, pattern (regex), format (email, date, etc.), enum (allowed values). Results in inline error messages when violated.

- **ConditionalRule**: Logic rule for show/hide (hiddenWhen), required enforcement (requiredWhen), or read-only state (readOnlyWhen). Contains field reference, comparison operator, and target value. Re-evaluated on field changes.

- **DataSource**: Named callback declaration in schema for initial data loading (onLoad) or dynamic options (options array). Maps to application-provided endpoint or function. For options, supports search query, pagination, and dependent field context.

- **UploadConstraint**: Per-field file upload configuration including callback name, maxFiles limit, maxSizeMB limit, and accept array of allowed MIME types. Enforced client-side before invoking upload callback.

- **LayoutSection**: Organizational structure for form fields including grid rows/columns, groups/fieldsets with titles, tabs for logical partitioning, or wizard steps with sequential validation. Controls visual presentation and navigation flow.

- **CalculatedField**: Read-only field with formula and dependency list. Formula is client-side JavaScript expression evaluated when dependencies change. Result displays in field but is not user-editable.

- **ChangeTracker**: Internal component state tracking which fields have been modified from initial values. Used for dirty field map included in submission callback for audit purposes.

- **OptionCache**: Session-scoped cache for remote option results keyed by {option source name, search query, dependsOn field values}. 10-minute TTL reduces redundant API calls for repeated queries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Forms with up to 75 fields render within 1.2 seconds from schema load to interactive state on standard corporate workstations
- **SC-002**: Form submission completes within 2.0 seconds round-trip including validation, callback execution, and response handling under typical office network conditions
- **SC-003**: Component supports 100 field forms without user-perceivable lag (interactions respond within 100ms)
- **SC-004**: 95% of validation errors are caught client-side before submission, reducing server round-trips
- **SC-005**: Users can successfully complete form creation tasks on first attempt with 90% success rate when proper training provided
- **SC-006**: Field-level inline errors enable users to correct validation failures in average of 15 seconds per error
- **SC-007**: Dynamic option searches return filtered results within 500ms of user stopping typing (300ms debounce + 200ms fetch)
- **SC-008**: Option result caching reduces duplicate API calls by 60% for forms with repeated queries
- **SC-009**: File uploads under 5MB complete within 3 seconds on standard office internet connection
- **SC-010**: Forms remain fully keyboard-navigable with all actions completable without mouse in under 2x the time of mouse-based interaction
- **SC-011**: Screen reader users can complete forms with equivalent success rate to sighted users when form schemas provide proper labels and descriptions
- **SC-012**: Forms degrade gracefully when remote option sources fail, with 100% of other form functionality remaining usable
- **SC-013**: Form schema validation catches 90% of schema authoring errors with actionable error messages before runtime
- **SC-014**: Development teams can create new forms 70% faster compared to custom-built form implementations
- **SC-015**: Form-related support tickets reduce by 40% after component adoption due to standardized validation and error messaging

### Assumptions

- **Assumption 1**: Forms are used by internal staff on corporate workstations with modern browsers, not public-facing on diverse devices or outdated browsers
- **Assumption 2**: Network connectivity is stable office environment; offline support not required for V1
- **Assumption 3**: Schema authors have access to schema documentation and examples; schema validation tooling will catch common errors
- **Assumption 4**: Application teams provide properly secured callback endpoints; component itself does not implement authentication/authorization
- **Assumption 5**: File upload virus/malware scanning is handled by existing firm infrastructure server-side; component is not responsible for security scanning
- **Assumption 6**: Initial data from onLoad callbacks is generally valid; if invalid, users can correct via normal editing workflow
- **Assumption 7**: Currency formatting uses en-GB locale only in V1; multi-currency and i18n deferred to V2
- **Assumption 8**: Cross-field validation (e.g., startDate < endDate) is deferred to V2; V1 supports field-level only
- **Assumption 9**: Draft saving and auto-save functionality deferred to V2; V1 requires explicit user submission
- **Assumption 10**: Schema versions are managed externally; component trusts provided schema is compatible with its supported dialect
