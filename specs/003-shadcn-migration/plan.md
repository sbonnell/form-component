# Implementation Plan: shadcn Component Migration

**Branch**: `003-shadcn-migration` | **Date**: 2025-11-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-shadcn-migration/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Migrate all form components in `/src` to use shadcn/ui components. Ensure alignment with Tailwind styling conventions. Maintain backward compatibility and accessibility standards. No changes to `/app` folder.

## Technical Context

**Language/Version**: TypeScript 5.3+, React 19.2+, Next.js 16.0.1  
**Primary Dependencies**: React Hook Form 7.51.0, Zod 3.23.0, shadcn/ui, Tailwind CSS 3.4+  
**Storage**: N/A  
**Testing**: Vitest, React Testing Library, Playwright  
**Target Platform**: Web (Next.js)  
**Project Type**: Library-first (reusable components)  
**Performance Goals**: ≤1.2s render time for 75 fields, ≤50KB gzipped bundle size  
**Constraints**: WCAG 2.1 AA compliance, zero breaking changes to component APIs  
**Scale/Scope**: 18 field components, 3 layout components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First Architecture**: ✅ All work confined to `/src`. No changes to `/app`.
- **Type Safety**: ✅ TypeScript strict mode enabled. Zod schemas for validation.
- **Schema-Driven Development**: ✅ JSON Schema defines form structure. No hard-coded forms.
- **Performance & Accessibility**: ✅ Targets defined in spec. WCAG 2.1 AA compliance required.
- **Code Quality**: ✅ ESLint, Prettier, and zero TypeScript errors enforced.

## Project Structure

### Documentation (this feature)

```text
specs/003-shadcn-migration/
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
│   ├── fields/          # Field components (e.g., InputField, SelectField)
│   ├── layout/          # Layout components (e.g., FieldWrapper, WizardLayout)
│   └── form-component/  # Form-level components
├── hooks/               # Custom React hooks
├── lib/                 # Utilities and helpers
└── types/               # TypeScript type definitions

tests/
├── contract/            # API contract tests
├── integration/         # Integration tests
└── unit/                # Unit tests
```

**Structure Decision**: Library-first structure ensures reusable components in `/src` and demo isolation in `/app`.

## Complexity Tracking

No violations of the constitution detected.
