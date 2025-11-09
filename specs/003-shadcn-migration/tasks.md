# Tasks: shadcn Component Migration

**Feature Branch**: `003-shadcn-migration`  
**Spec**: [spec.md](./spec.md)  
**Plan**: [plan.md](./plan.md)

## Phase 1: Setup

- [x] T001 Create project structure per implementation plan
- [x] T002 Install shadcn/ui components and update Tailwind configuration
- [x] T003 Verify TypeScript strict mode and ESLint configuration

## Phase 2: Foundational Tasks

- [x] T004 Refactor `/src/components/fields/` to use shadcn base components
- [x] T005 Refactor `/src/components/layout/` to use shadcn layout components
- [x] T006 Update Tailwind utility classes to align with shadcn styling

## Phase 3: User Story 1 - Basic Input Fields Migration (Priority: P1)

- [x] T007 [US1] Migrate TextField to use shadcn Input component
- [x] T008 [US1] Migrate TextareaField to use shadcn Textarea component
- [x] T009 [US1] Migrate NumberField to use shadcn Input component
- [x] T010 [US1] Migrate DateField to use shadcn Input component
- [x] T011 [US1] Migrate TimeField to use shadcn Input component

## Phase 4: User Story 2 - Select and Choice Components Migration (Priority: P1)

- [x] T012 [US2] Migrate SelectField to use shadcn Select component
- [x] T013 [US2] Migrate CheckboxField to use shadcn Checkbox component
- [x] T014 [US2] Migrate RadioField to use shadcn RadioGroup component
- [x] T015 [US2] Migrate ToggleField to use shadcn Switch component
- [x] T016 [US2] Migrate MultiSelectField to use shadcn Select component

## Phase 5: User Story 3 - Specialized Field Components Migration (Priority: P2)

- [x] T017 [US3] Migrate CurrencyField to use shadcn Input component
- [x] T018 [US3] Migrate MaskedField to use shadcn Input component
- [x] T019 [US3] Migrate FileUploadField to use shadcn Progress component
- [x] T020 [US3] Migrate DateTimeField to use shadcn Popover component
- [x] T021 [US3] Migrate CalculatedField to use shadcn Input component

## Phase 6: User Story 4 - Complex Field Types Migration (Priority: P3)

- [x] T022 [US4] Migrate ArrayField to use shadcn Button and Card components
- [x] T023 [US4] Migrate ObjectField to use shadcn Card components

## Phase 7: User Story 5 - Layout Components Migration (Priority: P2)

- [x] T024 [US5] Migrate FieldWrapper to use shadcn Label component
- [x] T025 [US5] Migrate WizardLayout to use shadcn Card and Tabs components
- [x] T026 [US5] Migrate TabLayout to use shadcn Tabs component

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T027 Verify WCAG 2.1 AA compliance for all migrated components
- [x] T028 Validate performance targets (≤1.2s render, ≤50KB bundle)
- [x] T029 Ensure zero breaking changes to component APIs
- [x] T030 Update documentation and examples in `/app`

## Dependencies

- User Story 1 → User Story 2 → User Story 3 → User Story 4 → User Story 5

## Parallel Execution Opportunities

- Tasks within the same user story can be executed in parallel.
- Setup and foundational tasks must complete before user story phases.

## MVP Scope

- Complete User Story 1 (Basic Input Fields Migration).