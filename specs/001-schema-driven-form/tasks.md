# Tasks: Schema-Driven Form Component V1

**Input**: Design documents from `/specs/001-schema-driven-form/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly required by the specification. Integration and E2E tests are included in later phases for quality assurance but are not TDD-driven.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to repository root following Next.js structure:
- Source: `src/`
- Tests: `tests/`
- Demo: `src/demo/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 14+ project with TypeScript 5.3+ strict mode and configure package.json dependencies
- [ ] T002 [P] Configure TypeScript with strict mode and path aliases in tsconfig.json
 - [x] T002 [P] Configure TypeScript with strict mode and path aliases in tsconfig.json
 - [x] T003 [P] Setup Tailwind CSS 3.x configuration in tailwind.config.ts with custom theme
 - [x] T004 [P] Configure ESLint and Prettier for TypeScript and React best practices
 - [x] T005 [P] Install shadcn/ui via CLI and add base components: form, input, label, select, tabs, button
 - [x] T006 [P] Setup Vitest configuration in vitest.config.ts for unit tests
 - [x] T007 [P] Setup Playwright configuration in playwright.config.ts for E2E tests
 - [x] T008 Create project directory structure matching plan.md layout in src/
 - [x] T009 [P] Configure bundle analyzer and set performance budget (<50KB gzipped) in next.config.js
 - [x] T010 [P] Create README.md with project overview and setup instructions

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions, utilities, and schema infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 [P] Copy contract types from specs/001-schema-driven-form/contracts/schema.types.ts to src/types/schema.ts
- [x] T012 [P] Copy contract types from specs/001-schema-driven-form/contracts/callbacks.types.ts to src/types/callbacks.ts
- [x] T013 [P] Create field configuration types in src/types/field.ts
- [x] T014 [P] Create validation types in src/types/validation.ts
- [x] T015 [P] Implement debounce utility in src/lib/utils/debounce.ts (300ms for search, 100ms for calculations)
- [x] T016 [P] Implement dot-notation path utility in src/lib/utils/dot-notation.ts (for nested field access)
- [x] T017 [P] Implement change tracker utility in src/lib/utils/change-tracker.ts (dirty fields detection)
- [x] T018 Implement JSON Schema parser in src/lib/schema/parser.ts (parse schema to internal format)
- [x] T019 Implement Zod schema generator in src/lib/schema/validator.ts (convert JSON Schema to Zod for validation)
- [x] T020 [P] Create schema type definitions in src/lib/schema/types.ts
- [x] T021 Create FieldWrapper component in src/components/layout/FieldWrapper.tsx (common container for all fields)
- [x] T022 [P] Create ValidationMessage component in src/components/validation/ValidationMessage.tsx (inline error display)
- [x] T023 [P] Create GlobalError component in src/components/validation/GlobalError.tsx (banner for submission errors)
- [x] T024 Create FormContext with React Context in src/components/form-component/FormContext.tsx (shared form state)
- [x] T025 Setup TanStack Query provider for options caching in src/lib/options/cache.ts (10-minute TTL)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Basic Form Creation and Submission (Priority: P1) 🎯 MVP

**Goal**: Enable users to create forms with basic fields (text, number, date, select), validate input, and submit data successfully. This is the minimum viable product.

**Independent Test**: Load a schema with 5-10 basic fields, fill in valid data, submit, and verify onSubmit callback receives correct data. Test validation by submitting invalid data and confirming inline errors appear.

### Implementation for User Story 1

- [x] T026 [P] [US1] Create TextField component in src/components/fields/TextField.tsx (basic text input with validation)
- [x] T027 [P] [US1] Create TextareaField component in src/components/fields/TextareaField.tsx (multi-line text)
- [x] T028 [P] [US1] Create NumberField component in src/components/fields/NumberField.tsx (numeric input with min/max)
- [x] T029 [P] [US1] Create DateField component in src/components/fields/DateField.tsx (date picker)
- [x] T030 [P] [US1] Create SelectField component in src/components/fields/SelectField.tsx (basic dropdown, static options)
- [x] T031 [P] [US1] Create CheckboxField component in src/components/fields/CheckboxField.tsx (boolean checkbox)
- [x] T032 Create field index exporter in src/components/fields/index.ts (export all field components)
- [x] T033 [US1] Implement useFormState hook in src/components/form-component/hooks/useFormState.ts (React Hook Form integration)
- [x] T034 [US1] Implement useValidation hook in src/components/form-component/hooks/useValidation.ts (Zod validation integration)
- [x] T035 [US1] Create field renderer logic in src/components/form-component/SchemaForm.tsx (map schema to components)
- [x] T036 [US1] Implement form submission flow in src/components/form-component/SchemaForm.tsx (onSubmit callback integration)
- [x] T037 [US1] Add validation error display in SchemaForm.tsx (inline and global errors)
- [x] T038 [US1] Implement Reset functionality in SchemaForm.tsx (revert to initial values)
- [x] T039 [US1] Create form component main export in src/components/form-component/index.ts
- [x] T040 [US1] Create basic example schema in src/demo/schemas/client-onboarding.json (5-10 fields)
- [x] T041 [US1] Implement mock onSubmit callback in src/demo/mocks/onSubmit.ts
- [x] T042 [US1] Create basic form demo page in src/demo/app/examples/basic/page.tsx
- [x] T043 [US1] Add integration test for form submission in tests/integration/form-submission.test.tsx

**Checkpoint**: User Story 1 complete - basic forms can be created, validated, and submitted. This is a deployable MVP.

---

## Phase 4: User Story 2 - Edit Existing Records with Change Tracking (Priority: P1)

**Goal**: Enable users to edit existing data with pre-populated fields and track which fields were modified for audit purposes.

**Independent Test**: Load a form in edit mode with initial data, modify 3-5 fields, submit, and verify onSubmit callback receives both complete data AND a dirty fields map showing only changed fields.

### Implementation for User Story 2

- [x] T044 [US2] Implement initialData prop handling in src/components/form-component/SchemaForm.tsx (populate form with existing data)
- [x] T045 [US2] Implement onLoad callback integration in src/lib/schema/parser.ts (fetch initial data)
- [x] T046 [US2] Integrate change tracker in useFormState hook in src/components/form-component/hooks/useFormState.ts (track dirty fields)
- [x] T047 [US2] Modify onSubmit to include changedFields map in src/components/form-component/SchemaForm.tsx
- [x] T048 [US2] Create edit mode example schema in src/demo/schemas/client-edit.json
- [x] T049 [US2] Implement mock onLoad callback in src/demo/mocks/onLoad.ts (return sample data)
- [x] T050 [US2] Create edit form demo page in src/demo/app/examples/edit/page.tsx
- [x] T051 [US2] Add integration test for edit mode in tests/integration/edit-mode.test.tsx (verify change tracking)

**Checkpoint**: User Stories 1 and 2 both work independently. Forms support create and edit modes with change tracking.

---

## Phase 5: User Story 3 - Dynamic Options with Search and Dependencies (Priority: P2)

**Goal**: Enable select fields to load options dynamically from remote sources with search, pagination, and dependent field filtering.

**Independent Test**: Create a select with remote options, type search text, verify debounced API call after 300ms. Configure dependent selects and verify child options refresh when parent changes.

### Implementation for User Story 3

- [ ] T052 [US3] Implement remote options fetcher in src/lib/options/fetcher.ts (call onOptions callback)
- [ ] T053 [US3] Implement option cache with TanStack Query in src/lib/options/cache.ts (10-min TTL, keyed by query)
- [ ] T054 [US3] Create option types in src/lib/options/types.ts
- [ ] T055 [US3] Enhance SelectField with search support in src/components/fields/SelectField.tsx (debounced input)
- [ ] T056 [US3] Add pagination support to SelectField in src/components/fields/SelectField.tsx (infinite scroll with nextPageToken)
- [ ] T057 [US3] Implement dependsOn logic in SelectField in src/components/fields/SelectField.tsx (refresh on parent change)
- [ ] T058 [US3] Create MultiSelectField component in src/components/fields/MultiSelectField.tsx (multiple selection with search)
- [ ] T059 [US3] Add error handling for failed option callbacks in src/lib/options/fetcher.ts (show error + retry button)
- [ ] T060 [US3] Implement mock onOptions callback in src/demo/mocks/onOptions.ts (simulate remote API)
- [ ] T061 [US3] Create dynamic options example schema in src/demo/schemas/trade-entry.json (with dependent selects)
- [ ] T062 [US3] Create dynamic options demo page in src/demo/app/examples/dynamic/page.tsx
- [ ] T063 [US3] Add integration test for dynamic options in tests/integration/dynamic-options.test.tsx

**Checkpoint**: User Stories 1, 2, and 3 work independently. Forms support static and dynamic options with search and dependencies.

---

## Phase 6: User Story 4 - Conditional Visibility and Required Fields (Priority: P2)

**Goal**: Enable fields to show/hide and become required/optional based on other field values, with validation adjusting dynamically.

**Independent Test**: Create schema with hiddenWhen and requiredWhen rules, toggle trigger fields, verify dependent fields appear/disappear and validation changes accordingly.

### Implementation for User Story 4

- [ ] T064 [P] [US4] Implement conditional rule evaluator in src/lib/conditional-logic/evaluator.ts (evaluate hiddenWhen/requiredWhen)
- [ ] T065 [P] [US4] Implement expression parser for conditional rules in src/lib/conditional-logic/expression-parser.ts (operators: equals, in, gt, etc.)
- [ ] T066 [US4] Create useConditionalLogic hook in src/components/form-component/hooks/useConditionalLogic.ts (re-evaluate on field changes)
- [ ] T067 [US4] Integrate conditional logic in SchemaForm.tsx to show/hide fields dynamically
- [ ] T068 [US4] Integrate conditional logic in useValidation hook to adjust required fields dynamically
- [ ] T069 [P] [US4] Implement calculated field evaluator in src/lib/calculations/evaluator.ts (parse and evaluate formulas)
- [ ] T070 [P] [US4] Implement dependency tracker for calculated fields in src/lib/calculations/dependency-tracker.ts
- [ ] T071 [US4] Create useCalculatedFields hook in src/components/form-component/hooks/useCalculatedFields.ts (recompute on dependency changes)
- [ ] T072 [US4] Create CalculatedField component in src/components/fields/CalculatedField.tsx (read-only display)
- [ ] T073 [US4] Create conditional logic example schema in src/demo/schemas/incident-report.json (with hiddenWhen/requiredWhen)
- [ ] T074 [US4] Create conditional logic demo page in src/demo/app/examples/conditional/page.tsx
- [ ] T075 [US4] Add integration test for conditional logic in tests/integration/conditional-logic.test.tsx

**Checkpoint**: User Stories 1-4 work independently. Forms support dynamic field visibility, conditional validation, and calculated fields.

---

## Phase 7: User Story 5 - File Upload with Constraints (Priority: P3)

**Goal**: Enable file upload fields with client-side validation (type, size, count) and progress tracking.

**Independent Test**: Configure file field with constraints, attempt uploads violating rules (type, size, count) and verify client-side blocking. Upload valid files and confirm onUpload callback returns file metadata.

### Implementation for User Story 5

- [ ] T076 [P] [US5] Create FileUploadField component in src/components/fields/FileUploadField.tsx (file input with validation)
- [ ] T077 [US5] Implement file validation in FileUploadField.tsx (check MIME type, size, count before upload)
- [ ] T078 [US5] Add upload progress tracking in FileUploadField.tsx (XMLHttpRequest progress events)
- [ ] T079 [US5] Add cancel and retry functionality in FileUploadField.tsx
- [ ] T080 [US5] Display uploaded file list with remove buttons in FileUploadField.tsx
- [ ] T081 [US5] Implement mock onUpload callback in src/demo/mocks/onUpload.ts (simulate file upload)
- [ ] T082 [US5] Create file upload example schema in src/demo/schemas/document-upload.json
- [ ] T083 [US5] Create file upload demo page in src/demo/app/examples/upload/page.tsx
- [ ] T084 [US5] Add integration test for file uploads in tests/integration/file-upload.test.tsx

**Checkpoint**: User Stories 1-5 work independently. Forms support file uploads with validation and progress tracking.

---

## Phase 8: User Story 6 - Complex Layouts (Grid, Tabs, Wizard) (Priority: P3)

**Goal**: Enable multi-section forms with grid layouts, tabs, and wizard steppers for organizing large forms (75+ fields).

**Independent Test**: Define schema with layout sections (grid, tabs, wizard), render form, and verify fields appear in correct sections with proper column widths and navigation.

### Implementation for User Story 6

- [ ] T085 [P] [US6] Create GridLayout component in src/components/layout/GridLayout.tsx (12-column responsive grid)
- [ ] T086 [P] [US6] Create FieldGroup component in src/components/layout/FieldGroup.tsx (fieldset with title)
- [ ] T087 [P] [US6] Create TabLayout component in src/components/layout/TabLayout.tsx (tab navigation with validation indicators)
- [ ] T088 [P] [US6] Create WizardLayout component in src/components/layout/WizardLayout.tsx (step-by-step with validation gates)
- [ ] T089 [US6] Integrate layout components in SchemaForm.tsx (render based on layout config)
- [ ] T090 [US6] Implement per-tab validation in TabLayout.tsx (show error indicators on tab headers)
- [ ] T091 [US6] Implement per-step validation in WizardLayout.tsx (validate before advancing to next step)
- [ ] T092 [US6] Create grid layout example schema in src/demo/schemas/complex-form-grid.json
- [ ] T093 [US6] Create tabs layout example schema in src/demo/schemas/complex-form-tabs.json
- [ ] T094 [US6] Create wizard layout example schema in src/demo/schemas/complex-form-wizard.json
- [ ] T095 [US6] Create wizard demo page in src/demo/app/examples/wizard/page.tsx
- [ ] T096 [US6] Add integration test for layouts in tests/integration/layouts.test.tsx

**Checkpoint**: User Stories 1-6 work independently. Forms support complex multi-section layouts for large forms.

---

## Phase 9: User Story 7 - Masked and Formatted Input (Priority: P3)

**Goal**: Enable automatic formatting for specialized inputs (IBAN, UK postcode, phone, currency) with en-GB locale support.

**Independent Test**: Create fields with mask patterns, type unformatted values, verify formatting applies automatically, and confirm submitted values are correctly parsed (unmasked).

### Implementation for User Story 7

- [ ] T097 [P] [US7] Define input masks in src/lib/formatting/masks.ts (IBAN, UK postcode, sort code, phone E.164)
- [ ] T098 [P] [US7] Implement currency formatting in src/lib/formatting/currency.ts (en-GB: comma thousands, period decimal)
- [ ] T099 [P] [US7] Create format validators in src/lib/formatting/validators.ts (validate formatted input)
- [ ] T100 [P] [US7] Create MaskedField component in src/components/fields/MaskedField.tsx (apply masks with react-input-mask)
- [ ] T101 [P] [US7] Create CurrencyField component in src/components/fields/CurrencyField.tsx (formatted currency input)
- [ ] T102 [P] [US7] Create TimeField component in src/components/fields/TimeField.tsx
- [ ] T103 [P] [US7] Create DateTimeField component in src/components/fields/DateTimeField.tsx
- [ ] T104 [P] [US7] Create RadioField component in src/components/fields/RadioField.tsx
- [ ] T105 [P] [US7] Create ToggleField component in src/components/fields/ToggleField.tsx
- [ ] T106 [P] [US7] Create ArrayField component in src/components/fields/ArrayField.tsx (repeater for array fields)
- [ ] T107 [P] [US7] Create ObjectField component in src/components/fields/ObjectField.tsx (nested field groups)
- [ ] T108 [US7] Update field index in src/components/fields/index.ts to export all new field types
- [ ] T109 [US7] Create masked input example schema in src/demo/schemas/financial-data.json
- [ ] T110 [US7] Create masked input demo page in src/demo/app/examples/masked/page.tsx
- [ ] T111 [US7] Add unit tests for formatting in tests/unit/lib/formatting/masks.test.ts
- [ ] T112 [US7] Add unit tests for currency in tests/unit/lib/formatting/currency.test.ts

**Checkpoint**: User Stories 1-7 complete. All features implemented - forms support all field types with proper formatting.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and overall quality

- [ ] T113 [P] Add accessibility attributes (ARIA labels, roles) to all field components
- [ ] T114 [P] Implement keyboard navigation for all interactive elements
- [ ] T115 [P] Add focus management for modals and wizards
- [ ] T116 [P] Implement unsaved changes warning dialog (beforeunload event)
- [ ] T117 [P] Implement schema version graceful degradation in src/lib/schema/parser.ts
- [ ] T118 Create demo home page in src/demo/app/page.tsx (navigation to all examples)
- [ ] T119 Create demo layout in src/demo/app/layout.tsx (navigation menu)
- [ ] T120 [P] Add E2E test for basic form in tests/e2e/basic-form.spec.ts
- [ ] T121 [P] Add E2E test for validation in tests/e2e/validation.spec.ts
- [ ] T122 [P] Add E2E test for conditional fields in tests/e2e/conditional-fields.spec.ts
- [ ] T123 [P] Add E2E test for dynamic options in tests/e2e/dynamic-options.spec.ts
- [ ] T124 [P] Add E2E test for wizard in tests/e2e/wizard.spec.ts
- [ ] T125 [P] Add unit tests for SchemaForm in tests/unit/components/SchemaForm.test.tsx
- [ ] T126 [P] Add unit tests for useFormState hook in tests/unit/hooks/useFormState.test.ts
- [ ] T127 [P] Add unit tests for useValidation hook in tests/unit/hooks/useValidation.test.ts
- [ ] T128 [P] Add unit tests for useConditionalLogic hook in tests/unit/hooks/useConditionalLogic.test.ts
- [ ] T129 [P] Add unit tests for schema parser in tests/unit/lib/schema/parser.test.ts
- [ ] T130 [P] Add unit tests for Zod validator in tests/unit/lib/schema/validator.test.ts
- [ ] T131 [P] Add unit tests for conditional evaluator in tests/unit/lib/conditional-logic/evaluator.test.ts
- [ ] T132 [P] Add unit tests for calculation evaluator in tests/unit/lib/calculations/evaluator.test.ts
- [ ] T133 [P] Optimize bundle size with code splitting for field components (React.lazy)
- [ ] T134 [P] Add react-window virtualization for large option lists (>100 items)
- [ ] T135 Run bundle analyzer and verify <50KB gzipped target
- [ ] T136 [P] Update README.md with usage examples from quickstart.md
- [ ] T137 [P] Create CHANGELOG.md with v1.0.0 release notes
- [ ] T138 Run full test suite and verify all tests pass
- [ ] T139 Validate quickstart.md examples work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories CAN proceed in parallel (if staffed appropriately)
  - Or sequentially in priority order: US1 → US2 → US3 → US4 → US5 → US6 → US7
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories ✅ MVP
- **User Story 2 (P1)**: Can start after Foundational - Extends US1 but independently testable
- **User Story 3 (P2)**: Can start after Foundational - Extends SelectField from US1 but independently testable
- **User Story 4 (P2)**: Can start after Foundational - Adds logic layer, independently testable
- **User Story 5 (P3)**: Can start after Foundational - New field type, independently testable
- **User Story 6 (P3)**: Can start after Foundational - Layout layer, independently testable
- **User Story 7 (P3)**: Can start after Foundational - New field types, independently testable

### Within Each User Story

- Field components marked [P] can be built in parallel (different files)
- Hooks and utilities marked [P] can be built in parallel
- Integration with SchemaForm.tsx typically happens after components are ready
- Demo pages and tests come after core implementation
- Each story should be testable independently before moving to next priority

### Parallel Opportunities

- **Phase 1**: All tasks marked [P] (T002-T010) can run in parallel after T001
- **Phase 2**: Tasks T011-T023 marked [P] can run in parallel; T024-T025 after T011-T020 complete
- **User Stories**: Once Foundational completes, ALL 7 user stories can start in parallel if team has capacity
- **Within US1**: Tasks T026-T032 (field components) can all run in parallel
- **Within US3**: SelectField enhancement (T055-T056) can run in parallel
- **Within US4**: Evaluator (T064-T065), calculated fields (T069-T070) can run in parallel
- **Within US6**: All layout components (T085-T088) can run in parallel
- **Within US7**: All field components (T097-T107) can run in parallel
- **Phase 10**: Most tasks marked [P] can run in parallel (tests, accessibility, docs)

---

## Parallel Example: User Story 1 (MVP)

After Foundational phase completes, launch these in parallel:

```bash
# All field components together:
Task T026: "Create TextField component in src/components/fields/TextField.tsx"
Task T027: "Create TextareaField component in src/components/fields/TextareaField.tsx"
Task T028: "Create NumberField component in src/components/fields/NumberField.tsx"
Task T029: "Create DateField component in src/components/fields/DateField.tsx"
Task T030: "Create SelectField component in src/components/fields/SelectField.tsx"
Task T031: "Create CheckboxField component in src/components/fields/CheckboxField.tsx"

# Then after field components complete:
Task T033: "Implement useFormState hook"
Task T034: "Implement useValidation hook"

# Then integrate into SchemaForm:
Task T035-T038: SchemaForm implementation
```

---

## Parallel Example: Multi-Story Team

With 3+ developers after Foundational phase:

```bash
Developer A: User Story 1 (T026-T043) - MVP priority
Developer B: User Story 2 (T044-T051) - Also P1 priority
Developer C: User Story 3 (T052-T063) - Can start immediately

# All three stories can be developed and tested independently
# Each delivers standalone value when complete
```

---

## Implementation Strategy

### MVP First (User Story 1 Only - Recommended)

1. **Phase 1**: Setup (T001-T010) - ~2-4 hours
2. **Phase 2**: Foundational (T011-T025) - ~1-2 days (CRITICAL)
3. **Phase 3**: User Story 1 (T026-T043) - ~3-5 days
4. **STOP and VALIDATE**: Test basic forms end-to-end independently
5. **DEPLOY MVP**: Basic forms with validation and submission working

**Total MVP Timeline**: ~1-2 weeks for a complete, deployable form component

### Incremental Delivery (Recommended)

1. **Foundation** (Phase 1-2) → Foundation ready, no user value yet
2. **+ User Story 1** (Phase 3) → **MVP DEPLOYED** - Basic forms work! ✅
3. **+ User Story 2** (Phase 4) → Edit mode with change tracking added
4. **+ User Story 3** (Phase 5) → Dynamic options with search added
5. **+ User Story 4** (Phase 6) → Conditional logic and calculations added
6. **+ User Story 5** (Phase 7) → File uploads added
7. **+ User Story 6** (Phase 8) → Complex layouts added
8. **+ User Story 7** (Phase 9) → All specialized field types added
9. **+ Polish** (Phase 10) → Production-ready with full test coverage

Each increment is independently testable and deployable.

### Parallel Team Strategy (If Staffed)

With 3-4 developers:

1. **Week 1**: All team - Setup + Foundational (T001-T025)
2. **Week 2-3**: 
   - Dev A: User Story 1 (T026-T043) - MVP
   - Dev B: User Story 2 (T044-T051) - Edit mode
   - Dev C: User Story 3 (T052-T063) - Dynamic options
   - Dev D: User Story 4 (T064-T075) - Conditional logic
3. **Week 4**:
   - Dev A: User Story 5 (T076-T084) - File uploads
   - Dev B: User Story 6 (T085-T096) - Layouts
   - Dev C: User Story 7 (T097-T112) - Masked inputs
   - Dev D: Polish (T113-T139) - Testing and quality
4. **Week 5**: Integration, testing, deployment

**Total Parallel Timeline**: ~4-5 weeks for complete feature

---

## Task Count Summary

- **Phase 1 (Setup)**: 10 tasks
- **Phase 2 (Foundational)**: 15 tasks - CRITICAL BLOCKING PHASE
- **Phase 3 (US1 - Basic Forms)**: 18 tasks - MVP ✅
- **Phase 4 (US2 - Edit Mode)**: 8 tasks
- **Phase 5 (US3 - Dynamic Options)**: 12 tasks
- **Phase 6 (US4 - Conditional Logic)**: 12 tasks
- **Phase 7 (US5 - File Uploads)**: 9 tasks
- **Phase 8 (US6 - Layouts)**: 12 tasks
- **Phase 9 (US7 - Masked Inputs)**: 16 tasks
- **Phase 10 (Polish)**: 27 tasks

**Total**: 139 tasks

**Parallelizable Tasks**: 78 marked with [P] (56% can run in parallel)

**MVP Scope** (Phases 1-3): 43 tasks - delivers basic working forms

---

## Notes

- All paths are relative to repository root
- [P] tasks = different files or independent logic, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Foundational phase (Phase 2) is CRITICAL - blocks all user stories
- User Story 1 alone is a viable MVP for deployment
- Commit after each task or logical group
- Run tests at each checkpoint to validate story independence
- Bundle analysis should be run regularly to maintain <50KB target
- Accessibility testing should validate WCAG 2.1 AA compliance
