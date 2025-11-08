# Implementation Plan: Schema-Driven Form Component V1

**Branch**: `001-schema-driven-form` | **Date**: 2025-11-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-schema-driven-form/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a schema-driven form component that renders create/edit forms from JSON Schema 2020-12 with UI extensions. The component will support 75+ fields with validation, conditional logic, dynamic options, file uploads, and complex layouts for internal financial firm use. Technical approach uses Next.js 14+ with React Server Components, TypeScript strict mode, Tailwind CSS for styling, and shadcn/ui for base components. Form state managed via React Hook Form with Zod schema validation. Component architecture follows composition pattern with separate field renderers, validation engine, conditional logic evaluator, and layout orchestrator.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode enabled)  
**Primary Dependencies**: Next.js 14+, React 18+, React Hook Form 7.x, Zod 3.x, Tailwind CSS 3.x, shadcn/ui components  
**Storage**: Client-side session storage for option cache; no persistent storage (callbacks handle server persistence)  
**Testing**: Vitest for unit tests, React Testing Library for component tests, Playwright for E2E tests  
**Target Platform**: Modern browsers (Chromium, Firefox, Safari current-1 versions), desktop-first responsive design  
**Project Type**: Web application - reusable form component library with demo/documentation site  
**Performance Goals**: 
  - Render: ≤1.2s for 75 fields, ≤100ms interaction response
  - Submit: ≤2.0s round-trip
  - Bundle: Core component <50KB gzipped
  - Support 100 concurrent field validations without UI blocking
**Constraints**: 
  - No server-side rendering for form component (client-only due to dynamic nature)
  - Support up to 100 fields with ≤3 nesting levels
  - Accessibility WCAG 2.1 AA compliance
  - No external dependencies for schema validation beyond Zod
  - Component must be framework-agnostic in API (can be used in any React app)
**Scale/Scope**: 
  - 300-person firm with 5-10 teams
  - Expected 50-100 unique form schemas
  - Concurrent usage: ~50 users during peak hours
  - Form complexity: 15-75 fields typical, up to 100 fields maximum

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Status**: ✅ PASSED (No constitution file with specific rules found - proceeding with industry best practices)

The project will follow standard React/Next.js best practices:
- Component library structure with clear separation of concerns
- TypeScript strict mode for type safety
- Comprehensive test coverage (unit, integration, E2E)
- Accessibility-first development
- Performance budgets enforced via bundler configuration
- Clear API contracts for callbacks and data structures

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── form-component/
│   │   ├── index.ts                    # Main export
│   │   ├── SchemaForm.tsx              # Root form component
│   │   ├── FormContext.tsx             # React context for form state
│   │   ├── types.ts                    # TypeScript interfaces
│   │   └── hooks/
│   │       ├── useFormState.ts         # Form state management
│   │       ├── useValidation.ts        # Validation logic
│   │       ├── useConditionalLogic.ts  # Show/hide/require rules
│   │       └── useCalculatedFields.ts  # Computed field values
│   ├── fields/
│   │   ├── index.ts
│   │   ├── TextField.tsx
│   │   ├── TextareaField.tsx
│   │   ├── NumberField.tsx
│   │   ├── CurrencyField.tsx
│   │   ├── DateField.tsx
│   │   ├── TimeField.tsx
│   │   ├── DateTimeField.tsx
│   │   ├── SelectField.tsx
│   │   ├── MultiSelectField.tsx
│   │   ├── RadioField.tsx
│   │   ├── CheckboxField.tsx
│   │   ├── ToggleField.tsx
│   │   ├── FileUploadField.tsx
│   │   ├── ArrayField.tsx
│   │   ├── ObjectField.tsx
│   │   ├── MaskedField.tsx
│   │   └── CalculatedField.tsx
│   ├── layout/
│   │   ├── GridLayout.tsx              # 12-column grid
│   │   ├── FieldGroup.tsx              # Fieldset grouping
│   │   ├── TabLayout.tsx               # Tab navigation
│   │   ├── WizardLayout.tsx            # Step-by-step wizard
│   │   └── FieldWrapper.tsx            # Common field container
│   ├── validation/
│   │   ├── ValidationMessage.tsx       # Inline error display
│   │   ├── GlobalError.tsx             # Top-level error banner
│   │   └── validators.ts               # Custom validation functions
│   └── ui/
│       ├── Button.tsx                  # shadcn/ui components
│       ├── Input.tsx
│       ├── Label.tsx
│       ├── Select.tsx
│       ├── Tabs.tsx
│       └── [other shadcn components]
├── lib/
│   ├── schema/
│   │   ├── parser.ts                   # Parse JSON Schema to internal format
│   │   ├── validator.ts                # JSON Schema validation
│   │   └── types.ts                    # Schema type definitions
│   ├── conditional-logic/
│   │   ├── evaluator.ts                # Evaluate hiddenWhen/requiredWhen
│   │   └── expression-parser.ts        # Parse conditional expressions
│   ├── options/
│   │   ├── cache.ts                    # Session-based option caching
│   │   ├── fetcher.ts                  # Remote option loading
│   │   └── types.ts                    # Option interfaces
│   ├── formatting/
│   │   ├── masks.ts                    # Input mask definitions (IBAN, phone, etc.)
│   │   ├── currency.ts                 # Currency formatting (en-GB)
│   │   └── validators.ts               # Format validation
│   ├── calculations/
│   │   ├── evaluator.ts                # Evaluate calculated field formulas
│   │   └── dependency-tracker.ts       # Track field dependencies
│   └── utils/
│       ├── change-tracker.ts           # Dirty field tracking
│       ├── dot-notation.ts             # Nested field path handling
│       └── debounce.ts                 # Debounce utilities
├── types/
│   ├── schema.ts                       # JSON Schema + extensions types
│   ├── callbacks.ts                    # Callback function signatures
│   ├── field.ts                        # Field configuration types
│   └── validation.ts                   # Validation types
└── demo/                               # Demo application
    ├── app/
    │   ├── page.tsx                    # Demo home page
    │   ├── examples/
    │   │   ├── basic/page.tsx          # Basic form example
    │   │   ├── conditional/page.tsx    # Conditional logic demo
    │   │   ├── dynamic/page.tsx        # Dynamic options demo
    │   │   ├── upload/page.tsx         # File upload demo
    │   │   └── wizard/page.tsx         # Wizard layout demo
    │   └── layout.tsx
    ├── schemas/                        # Example schemas
    │   ├── client-onboarding.json
    │   ├── trade-entry.json
    │   └── incident-report.json
    └── mocks/                          # Mock callback implementations
        ├── onLoad.ts
        ├── onOptions.ts
        ├── onUpload.ts
        └── onSubmit.ts

tests/
├── unit/
│   ├── components/
│   │   ├── SchemaForm.test.tsx
│   │   └── fields/
│   │       ├── TextField.test.tsx
│   │       ├── SelectField.test.tsx
│   │       └── [other field tests]
│   ├── lib/
│   │   ├── schema/
│   │   │   ├── parser.test.ts
│   │   │   └── validator.test.ts
│   │   ├── conditional-logic/
│   │   │   └── evaluator.test.ts
│   │   ├── formatting/
│   │   │   ├── masks.test.ts
│   │   │   └── currency.test.ts
│   │   └── calculations/
│   │       └── evaluator.test.ts
│   └── hooks/
│       ├── useFormState.test.ts
│       ├── useValidation.test.ts
│       └── useConditionalLogic.test.ts
├── integration/
│   ├── form-submission.test.tsx        # End-to-end form flows
│   ├── conditional-logic.test.tsx      # Rule evaluation
│   ├── dynamic-options.test.tsx        # Remote options
│   ├── file-upload.test.tsx            # Upload flows
│   └── layouts.test.tsx                # Grid/tabs/wizard
└── e2e/
    ├── basic-form.spec.ts              # Playwright E2E tests
    ├── validation.spec.ts
    ├── conditional-fields.spec.ts
    ├── dynamic-options.spec.ts
    └── wizard.spec.ts
```

**Structure Decision**: Web application (Option 2) structure selected. The project uses a monorepo approach with the component library in `src/` and a demo application in `src/demo/`. The component is designed as a standalone library that can be published to npm while the demo serves as both documentation and development environment. Source code is organized by technical concern (components, lib, types) with clear separation between presentational components, business logic, and utilities.
