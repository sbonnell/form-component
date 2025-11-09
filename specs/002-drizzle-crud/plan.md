# Implementation Plan: Drizzle ORM CRUD with Auto-Generated Forms

**Branch**: `002-drizzle-crud` | **Date**: November 8, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-drizzle-crud/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Automatically generate CRUD interfaces from Drizzle ORM table schemas using the existing Schema-Driven Form component. The system will analyze Drizzle table definitions and produce compatible form schemas, enabling full Create, Read, Update, Delete operations without manual schema writing. Demo pages under `/app/demo/crud/` will showcase functionality with three sample tables (users, transactions, goods) using SQLite database with pre-populated data and optional reset capability.

## Technical Context

**Language/Version**: TypeScript 5.3+ (strict mode)  
**Primary Dependencies**: Next.js 16.0.1, React 19.2.0, React Hook Form 7.51.0, Zod 3.23.0, Drizzle ORM (NEEDS CLARIFICATION: version), better-sqlite3 (NEEDS CLARIFICATION: version)  
**Storage**: SQLite database via better-sqlite3, file-based persistence in `/app/demo/crud/` directory  
**Testing**: Vitest 4.0.8, @testing-library/react 16.3.0  
**Target Platform**: Web (Next.js App Router), demo pages under `/app/demo/crud/`  
**Project Type**: Web application (existing Next.js project, adding demo pages to `/app`)  
**Performance Goals**: List view loads in <1s, create/edit operations complete in <2s, pagination navigation <1s  
**Constraints**: All demo/test code in `/app` NOT `/src`, SQLite file persists across restarts, text truncation at 100 chars, last-write-wins concurrency  
**Scale/Scope**: Demo focused (3 tables: users, transactions, goods), 20+ sample records per table, 100+ record pagination support

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| All code in appropriate directory (`/app` for demo, NOT `/src`) | ✅ PASS | Requirement explicitly states demo under `/app` |
| Reuses existing Schema-Driven Form component | ✅ PASS | Core requirement: leverage existing form infrastructure |
| Type-safe (TypeScript strict mode) | ✅ PASS | Project already uses TypeScript 5.3+ strict |
| Testable (integration tests for CRUD operations) | ⚠️ VERIFY | Must add integration tests for auto-generation and CRUD flows |
| Zero external dependencies for demo (self-contained SQLite) | ✅ PASS | better-sqlite3 is file-based, no external DB required |
| Performance targets measurable | ✅ PASS | Spec defines: <1s list load, <2s save, <1s pagination |

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
app/
├── demo/
│   └── crud/
│       ├── users/
│       │   └── page.tsx          # Users CRUD demo page
│       ├── transactions/
│       │   └── page.tsx          # Transactions CRUD demo page
│       ├── goods/
│       │   └── page.tsx          # Goods CRUD demo page
│       ├── components/
│       │   ├── CrudList.tsx      # Generic list view component
│       │   ├── CrudForm.tsx      # Generic form component (create/edit)
│       │   └── ResetButton.tsx   # Demo data reset button
│       ├── lib/
│       │   ├── db/
│       │   │   ├── schema.ts     # Drizzle table schemas (users, transactions, goods)
│       │   │   ├── client.ts     # SQLite connection setup
│       │   │   └── seed.ts       # Sample data seeding logic
│       │   ├── generator/
│       │   │   ├── schema-generator.ts    # Drizzle → Form Schema converter
│       │   │   └── type-mappings.ts       # Column type → Field type mappings
│       │   └── crud-operations.ts         # Generic CRUD functions
│       └── demo.db                # SQLite database file (gitignored)
│
src/                               # Existing form component code (unchanged)
│
tests/
├── integration/
│   └── drizzle-crud.test.tsx     # Integration tests for auto-generation + CRUD
└── unit/
    └── schema-generator.test.ts   # Unit tests for schema generation logic
```

**Structure Decision**: Web application structure using Next.js App Router. All demo functionality isolated under `/app/demo/crud/` per requirements. Reuses existing `src/` components (SchemaForm, field components) without modification. Database and generation logic colocated with demo pages since this is demo-specific functionality, not core library code.

## Complexity Tracking

No constitution violations requiring justification.
