<!--
SYNC IMPACT REPORT - Version 1.0.0
==================================
Version Change: (none) → 1.0.0
Created: 2025-11-09

INITIAL CONSTITUTION - New Principles:
- I. Library-First Architecture (reusable components in /src)
- II. Demo Isolation (/app for testing only)
- III. Type Safety (TypeScript strict mode, Zod validation)
- IV. Schema-Driven Development (JSON Schema as single source of truth)
- V. Performance & Accessibility (measurable standards)

Templates Updated:
✅ plan-template.md - Constitution Check section aligns with principles
✅ spec-template.md - User stories and requirements align with schema-driven approach
✅ tasks-template.md - Task organization supports library-first and demo isolation
✅ copilot-instructions.md - Contains current tech stack matching principles

Follow-up TODOs: None - all placeholders filled
-->

# Schema-Driven Form Component Constitution

## Core Principles

### I. Library-First Architecture

The `/src` folder MUST contain ONLY reusable, framework-agnostic functionality that can be imported into other projects. The `/app` folder MUST contain ONLY demonstration, testing, and usage examples.

**Rationale**: This project is a reusable form library, not a standalone application. Clear separation ensures the core functionality remains portable and prevents demo code from polluting the library.

**Rules**:
- All core form components, utilities, hooks, and types MUST reside in `/src`
- All demo pages, example schemas, test databases, and sample implementations MUST reside in `/app`
- No component in `/src` may import from `/app`
- `/app` may freely import from `/src` via `@/` path aliases
- New features MUST be added to `/src` first, then demonstrated in `/app`

### II. Type Safety (NON-NEGOTIABLE)

TypeScript MUST be used in strict mode across the entire codebase. Runtime validation MUST be implemented using Zod schemas. All form schemas MUST define complete type definitions.

**Rationale**: Financial applications require data integrity. Type safety catches errors at compile time, while runtime validation ensures data correctness at the application boundary.

**Rules**:
- `tsconfig.json` MUST have `"strict": true` enabled
- All function parameters, return types, and component props MUST be explicitly typed
- No use of `any` type unless absolutely necessary (document justification)
- All external data (API responses, form submissions) MUST be validated with Zod
- All unused variables and imports MUST be removed (ESLint enforcement)
- Zero TypeScript compilation errors MUST be maintained

### III. Schema-Driven Development

JSON Schema (draft 2020-12) is the single source of truth for form structure, validation, and UI configuration. Forms MUST be generated from schemas, not hard-coded.

**Rationale**: Schema-driven approach enables dynamic form generation, ensures consistency between validation rules and UI, and allows forms to be configured without code changes.

**Rules**:
- All forms MUST be defined using JSON Schema with UI extensions
- Form structure MUST NOT be hard-coded in components (use schema parsing)
- Validation rules MUST be derived from JSON Schema (converted to Zod)
- UI rendering MUST respect schema-defined field types, widgets, and layouts
- Schema changes MUST NOT require component code changes (within defined capabilities)
- When using Drizzle ORM, schemas MUST be auto-generated via `drizzleTableToFormSchema()`

### IV. Performance & Accessibility Standards

Forms MUST meet measurable performance targets and WCAG 2.1 AA accessibility compliance. These are non-negotiable requirements for production deployment.

**Rationale**: Financial firms require performant, accessible applications for regulatory compliance and user productivity.

**Rules**:
- **Performance Targets** (MUST be met):
  - Core form component bundle: ≤50KB gzipped
  - Form render time: ≤1.2 seconds for 75 fields
  - Input interaction response: ≤100ms
  - Form submission round-trip: ≤2.0 seconds (network dependent)
  - Support up to 100 fields without UI blocking
- **Accessibility Requirements** (MUST be met):
  - WCAG 2.1 AA compliance verified
  - Full keyboard navigation support
  - Proper ARIA labels, roles, and states
  - Screen reader tested
  - High contrast mode support
  - Focus management in wizards and conditional fields

### V. Code Quality & Cleanliness

Code MUST be maintainable, readable, and free of unnecessary complexity. Regular cleanup MUST be performed to prevent technical debt accumulation.

**Rationale**: Clean code reduces bugs, accelerates onboarding, and improves long-term maintainability critical for internal libraries.

**Rules**:
- ESLint MUST pass without errors
- Unused imports and variables MUST be removed immediately
- Functions SHOULD be single-purpose and well-named
- Complex logic MUST include explanatory comments
- Magic numbers MUST be replaced with named constants
- Duplicate code MUST be refactored into shared utilities
- Formatting MUST be consistent (Prettier enforced)

## Technology Standards

### Required Stack

**Runtime & Framework**:
- Next.js 16.0+ (App Router, Server Actions, Turbopack)
- React 19.2+ (with Concurrent Features)
- Node.js 18.17+ (LTS version)
- TypeScript 5.3+ (strict mode enabled)

**Form Management**:
- React Hook Form 7.51+ (form state management)
- Zod 3.23+ (validation schema and runtime validation)
- JSON Schema draft 2020-12 (form schema definition)

**UI & Styling**:
- Tailwind CSS 3.4+ (utility-first styling)
- shadcn/ui components (accessible component primitives)
- Radix UI (unstyled component primitives)
- Lucide React (iconography)

**Data Management** (when applicable):
- TanStack Query 5.28+ (server state, caching for dynamic options)
- Drizzle ORM 0.36+ (if database integration required)
- sql.js 1.10+ (SQLite in browser/Node.js for demos)

**Testing**:
- Vitest (unit and integration tests)
- React Testing Library (component testing)
- Playwright (E2E testing)

### Versioning Policy

- **MAJOR**: Breaking API changes, removed functionality, incompatible schema changes
- **MINOR**: New features, new field types, backward-compatible enhancements
- **PATCH**: Bug fixes, performance improvements, documentation updates

## Development Workflow

### Feature Development Process

1. **Specification First**: All new features MUST have a spec in `/specs/[###-feature-name]/spec.md` with user stories and acceptance criteria
2. **Plan & Research**: Create implementation plan documenting technical approach and dependencies
3. **Library Implementation**: Build reusable functionality in `/src` with proper TypeScript types
4. **Demo Creation**: Create demonstration in `/app` showing feature usage
5. **Documentation**: Update README.md, spec status, and inline code comments
6. **Quality Gates**: ESLint passing, zero TypeScript errors, performance targets met

### Code Organization

**Single Source of Truth**:
- Form schemas define structure, validation, and UI configuration
- TypeScript types derived from schemas (not vice versa)
- Database schemas (if using Drizzle) auto-generate form schemas

**Import Hierarchy**:
- `/app` → `/src` (allowed)
- `/src` → `/src` (allowed)
- `/src` → `/app` (FORBIDDEN)
- External dependencies → Project code (standard)

**File Structure Conventions**:
```
/src/components/     - Reusable React components
/src/lib/           - Core utilities, parsers, generators
/src/hooks/         - Custom React hooks
/src/types/         - TypeScript type definitions
/app/               - Demo pages and examples
/app/demo/          - Demonstration features (e.g., CRUD)
/specs/             - Feature specifications and plans
/tests/             - Test suites
```

### Quality Assurance

**Pre-Commit Requirements**:
- ESLint errors MUST be fixed (warnings acceptable with justification)
- TypeScript MUST compile without errors
- Unused imports/variables MUST be removed
- Code MUST be formatted with Prettier

**Pre-Merge Requirements**:
- All acceptance criteria from spec MUST be met
- Performance targets MUST be validated
- Accessibility MUST be verified (keyboard nav, screen reader)
- Documentation MUST be updated (README, spec status, inline comments)

**Post-Implementation**:
- Update `.github/copilot-instructions.md` with new technologies or patterns
- Update relevant specs to "Implemented" status with implementation summary
- Add examples to demo pages in `/app`

## Governance

This constitution supersedes all other development practices and preferences. All development decisions MUST align with these principles. Deviations require explicit justification documented in the relevant specification or plan.

**Amendment Process**:
- Amendments MUST be documented with rationale
- Version MUST be incremented according to semantic versioning
- All templates in `.specify/templates/` MUST be reviewed for consistency
- `.github/copilot-instructions.md` MUST be updated if principles affect development guidance
- Sync Impact Report MUST be added to constitution as HTML comment

**Compliance Verification**:
- All feature plans MUST include "Constitution Check" section validating alignment
- Code reviews MUST verify adherence to core principles
- Regular audits MUST check for `/src` → `/app` import violations
- Performance benchmarks MUST be run before major releases

**Complexity Justification**:
- Any violation of principles MUST be justified in plan.md "Complexity Tracking" section
- Simpler alternatives MUST be documented and reasoning for rejection provided
- Temporary violations MUST include migration plan to compliance

**Runtime Development Guidance**:
- Use `.github/copilot-instructions.md` for current tech stack and patterns
- Refer to this constitution for architectural decisions and constraints
- Check feature specs for domain-specific requirements

**Version**: 1.0.0 | **Ratified**: 2025-11-08 | **Last Amended**: 2025-11-09
