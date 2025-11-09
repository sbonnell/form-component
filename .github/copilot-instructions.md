# form-component Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-11-08

## Active Technologies
- TypeScript 5.3+ (strict mode) + Next.js 16.0.1, React 19.2.0, React Hook Form 7.51.0, Zod 3.23.0, Drizzle ORM 0.36.4, sql.js 1.10.0 (002-drizzle-crud)
- SQLite database via sql.js, file-based persistence in `/app/demo/crud/` directory (002-drizzle-crud)

- TypeScript 5.3+ (strict mode enabled) + Next.js 14+, React 18+, React Hook Form 7.x, Zod 3.x, Tailwind CSS 3.x, shadcn/ui components (001-schema-driven-form)

## Project Structure

```text
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.3+ (strict mode enabled): Follow standard conventions

## Recent Changes
- 002-drizzle-crud: Updated to TypeScript 5.3+ strict mode, Next.js 16.0.1, React 19.2.0, React Hook Form 7.51.0, Zod 3.23.0, Drizzle ORM 0.36.4, sql.js 1.10.0, drizzle-kit 0.28.1. Using sql.js instead of better-sqlite3 for cross-platform SQLite support (Windows C++ build tools not required).

- 001-schema-driven-form: TypeScript 5.3+ strict mode, Next.js 14+, React 18+, React Hook Form 7.x, Zod 3.x, Tailwind CSS 3.x, shadcn/ui components

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
