# form-component Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-09

## Active Technologies
- TypeScript 5.3+ (strict mode) + Next.js 16.0.1, React 19.2.0, React Hook Form 7.51.0, Zod 3.23.0, shadcn/ui components, lucide-react icons, date-fns 4.1.0 (003-shadcn-migration)
- Drizzle ORM 0.36.4, sql.js 1.10.0, SQLite database via sql.js, file-based persistence in `/app/demo/crud/` directory (002-drizzle-crud)
- Tailwind CSS 3.4.0 with shadcn design tokens, tailwind-merge, clsx utilities (003-shadcn-migration)

## Project Structure

```text
src/
  components/
    fields/          # Form field components (shadcn migrated)
    layout/          # Layout components (FieldWrapper, WizardLayout, TabLayout)
    ui/              # shadcn/ui components (13 installed)
  lib/
    generator/       # Schema generators
    formatting/      # Formatters and validators
    calculations/    # Calculation engine
    options/         # Dynamic options provider
    schema/          # Schema utilities
app/
  demo/              # Demo pages
  examples/          # Example forms
  builder/           # Form builder with live preview
tests/
  integration/       # Integration tests
  unit/              # Unit tests
```

## Commands

npm test; npm run lint; npm run build

## Code Style

TypeScript 5.3+ (strict mode enabled): Follow standard conventions

## Recent Changes
- 003-shadcn-migration: Migrated all 20+ form field components and 3 layout components to shadcn/ui design system. Added Calendar component with date-fns 4.1.0 for professional date/datetime pickers. All components use lucide-react icons and shadcn design tokens (primary, destructive, muted-foreground, etc.). Schema Editor updated with horizontal scroll and no text wrapping.

- 002-drizzle-crud: Updated to TypeScript 5.3+ strict mode, Next.js 16.0.1, React 19.2.0, React Hook Form 7.51.0, Zod 3.23.0, Drizzle ORM 0.36.4, sql.js 1.10.0, drizzle-kit 0.28.1. Using sql.js instead of better-sqlite3 for cross-platform SQLite support (Windows C++ build tools not required).

- 001-schema-driven-form: TypeScript 5.3+ strict mode, Next.js 14+, React 18+, React Hook Form 7.x, Zod 3.x, Tailwind CSS 3.x, shadcn/ui components

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
