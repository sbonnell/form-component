# Research: Schema-Driven Form Component V1

**Feature**: 001-schema-driven-form  
**Date**: 2025-11-08  
**Status**: Complete

## Overview

This document consolidates research findings for technical decisions, libraries, patterns, and best practices for implementing the Schema-Driven Form Component.

---

## 1. Form State Management

### Decision: React Hook Form

**Rationale**:
- Optimized for performance with uncontrolled components (reduces re-renders)
- Native TypeScript support with strong type inference
- Built-in validation integration (compatible with Zod, Yup, custom validators)
- Excellent support for dynamic fields, arrays, and nested objects
- Field-level subscriptions prevent unnecessary re-renders (critical for 100-field forms)
- Small bundle size (~9KB minified + gzipped)
- Active maintenance and large community

**Alternatives Considered**:
- **Formik**: Larger bundle (~15KB), controlled components cause more re-renders with many fields
- **React Final Form**: Good performance but smaller ecosystem, less TypeScript support
- **Custom state management with useReducer**: Would require significant custom code for validation, dirty tracking, and error handling

**Implementation Notes**:
- Use `useForm` with `mode: "onBlur"` for validation to reduce noise during typing
- Leverage `watch` API with field-level subscriptions for conditional logic
- Use `Controller` wrapper for custom field components
- Implement custom `register` wrappers for masked inputs

---

## 2. Schema Validation

### Decision: Zod

**Rationale**:
- TypeScript-first design with excellent type inference
- Runtime validation catches data issues before submission
- Composable schema builders support JSON Schema to Zod conversion
- Small bundle size (~12KB minified + gzipped)
- Better error messages than JSON Schema validators
- Native integration with React Hook Form via `@hookform/resolvers`
- Can generate TypeScript types from schemas for full type safety

**Alternatives Considered**:
- **Ajv (JSON Schema validator)**: Direct JSON Schema 2020-12 support but weaker TypeScript integration, larger bundle for full feature set
- **Yup**: Similar to Zod but lacks TypeScript-first design, slightly larger bundle
- **Custom validation**: Would duplicate JSON Schema validation logic, miss edge cases

**Implementation Notes**:
- Build Zod schema generator from JSON Schema 2020-12 spec
- Map JSON Schema `format` to Zod refinements (email, date, regex patterns)
- Handle `if/then/else` conditionals via Zod's `.superRefine()` for complex validations
- Cache generated Zod schemas per form schema to avoid rebuild overhead

---

## 3. UI Component Library

### Decision: shadcn/ui

**Rationale**:
- Not a dependency - components copied into project (full control, no version lock-in)
- Built on Radix UI primitives (accessibility, keyboard navigation)
- Tailwind CSS styling (consistent with project choice)
- Customizable without wrestling with library APIs
- Excellent TypeScript support
- Includes all needed components: Input, Select, Tabs, Accordion, Dialog, etc.
- WCAG 2.1 AA compliant out of box

**Alternatives Considered**:
- **Headless UI**: Good accessibility but less feature-complete (no Select with search)
- **MUI**: Too heavy (large bundle), opinionated design hard to override for financial UI
- **Ant Design**: Large bundle, harder to customize, not Tailwind-based
- **Chakra UI**: Good option but adds runtime CSS-in-JS overhead

**Implementation Notes**:
- Install via CLI: `npx shadcn-ui@latest add form input select tabs ...`
- Customize Tailwind theme for financial firm brand colors
- Extend Select component for async option loading with search
- Add upload progress variant to existing Button/Dialog components

---

## 4. Conditional Logic Evaluation

### Decision: Custom Expression Evaluator

**Rationale**:
- JSON Schema `if/then/else` too rigid for UI visibility rules
- Need custom syntax like `{ field: "hasFees", equals: true }`
- Security: Must NOT use `eval()` or `new Function()` for untrusted schemas
- Simple comparison operators sufficient for V1: `equals`, `notEquals`, `in`, `notIn`, `greaterThan`, `lessThan`
- Predictable performance (<1ms per rule evaluation)

**Alternatives Considered**:
- **JSONLogic**: External library (3KB), overkill for simple comparisons, another syntax to learn
- **eval() with sandboxing**: Security risk even with sanitization
- **JSON Schema if/then/else**: Cannot express "hide field B when field A == value"

**Implementation Notes**:
- Build small evaluator: `evaluateCondition(rule, formValues) => boolean`
- Support operators: `equals`, `notEquals`, `in`, `notIn`, `gt`, `gte`, `lt`, `lte`, `isEmpty`, `isNotEmpty`
- Handle dot-notation for nested fields: `contact.email`
- Memoize evaluations with dependency tracking to avoid redundant computation

---

## 5. Dynamic Options (Remote Data)

### Decision: TanStack Query (React Query)

**Rationale**:
- Built-in caching with TTL, perfect for 10-minute option cache requirement
- Automatic request deduplication (multiple selects for same data = 1 request)
- Background refetching and stale-while-revalidate patterns
- Pagination support via `getNextPageParam`
- TypeScript support with strong typing for queries
- Devtools for debugging cache state
- Small bundle size (~12KB)

**Alternatives Considered**:
- **SWR**: Good option but less powerful pagination support, smaller ecosystem
- **Custom fetch + cache**: Would reimplement React Query features poorly
- **RTK Query**: Too heavy for component library, Redux dependency unwanted

**Implementation Notes**:
- Query key structure: `['options', sourceName, query, JSON.stringify(dependsOn)]`
- Set `staleTime: 10 * 60 * 1000` (10 minutes) per requirements
- Use `useInfiniteQuery` for paginated selects with scroll loading
- Implement error retry with exponential backoff (max 3 retries)
- Cache per-session only (clear on unmount or schema change via `cacheKey`)

---

## 6. File Upload

### Decision: Custom Upload Component with Progress

**Rationale**:
- Need fine-grained control over validation (type, size, count)
- Progress tracking requires XMLHttpRequest or Fetch with ReadableStream
- Existing libraries (react-dropzone, react-upload) don't fit callback contract
- Simple requirements don't justify large dependency

**Alternatives Considered**:
- **react-dropzone**: Good drag-drop UX but doesn't handle upload callback contract
- **Uppy**: Too heavy (100KB+), designed for complex upload scenarios
- **Input type="file"**: Works but need custom progress, validation, preview

**Implementation Notes**:
- Use `<input type="file" multiple accept="..." />` with custom wrapper
- Validate client-side: MIME type, file size, file count before upload callback
- Show progress with XMLHttpRequest `upload.onprogress` event
- Display file list with remove buttons and retry for failed uploads
- Return structure: `{ fileId, url, name, size, mimeType, checksum }` per spec

---

## 7. Input Masking

### Decision: react-input-mask + Custom Masks

**Rationale**:
- Lightweight (3KB), simple API
- Supports custom mask definitions
- Works with React Hook Form Controller
- Can define UK-specific masks (postcode, sort code, IBAN)

**Alternatives Considered**:
- **IMask**: More powerful but larger (12KB), overkill for basic masking
- **Cleave.js**: Good for currency but poor React integration
- **Custom implementation**: Reinventing wheel for complex cases like IBAN

**Implementation Notes**:
- Define custom masks:
  - UK Postcode: `AA## #AA` or `A## #AA` (regex-based)
  - UK Sort Code: `##-##-##`
  - IBAN: Dynamic length based on country code prefix
  - E.164 Phone: `+## ## #### ####` (variable by country)
- Store unmasked value in form state, display masked
- Currency handled separately with Intl.NumberFormat (en-GB locale)

---

## 8. Calculated Fields

### Decision: Custom Formula Evaluator with AST Parsing

**Rationale**:
- Need safe evaluation without `eval()` for security
- Support simple arithmetic: `(values.fees || 0) * 0.9`
- Parse formula string to AST, evaluate with form values
- Libraries like mathjs (30KB) too heavy for simple calculations

**Alternatives Considered**:
- **mathjs**: Full expression library (30KB+), overkill for simple formulas
- **eval() with sandbox**: Security risk
- **Limited operators**: Too restrictive for business logic

**Implementation Notes**:
- Build minimal expression parser supporting: `+`, `-`, `*`, `/`, `%`, `||`, `&&`, `()`, field references
- Evaluate AST with current form values
- Track dependencies via AST analysis (field references)
- Recompute on dependency change with debounce (100ms)
- Prevent circular dependencies with dependency graph validation

---

## 9. Layout System

### Decision: Custom Layout Components + Tailwind Grid

**Rationale**:
- Tailwind's 12-column grid perfect for responsive layouts
- Need custom Tab/Wizard components to track validation state per section
- shadcn/ui provides base Tabs component, extend for validation indicators
- Wizard needs custom step navigation with validation gates

**Alternatives Considered**:
- **react-grid-layout**: Too heavy (drag-drop not needed), complex API
- **CSS Grid directly**: Need abstraction for schema-driven column specs
- **Flexbox only**: Grid more predictable for complex multi-column layouts

**Implementation Notes**:
- Grid: Map schema `ui.width` (1-12) to Tailwind classes `col-span-{width}`
- Tabs: Track per-tab validation state, show error indicator on tab label
- Wizard: Linear step array with `currentStep` state, validate on "Next" click
- Groups: Render as `<fieldset>` with `<legend>` for accessibility

---

## 10. Accessibility

### Decision: WCAG 2.1 AA Compliance via Radix + ARIA

**Rationale**:
- shadcn/ui built on Radix UI (excellent a11y out of box)
- All interactive components keyboard-navigable
- Screen reader support via ARIA labels, descriptions, live regions
- Focus management built into Radix components

**Implementation Notes**:
- Use `<Label>` for all fields with `htmlFor` attribute
- Error messages in `aria-describedby` + `aria-invalid`
- Required fields marked with `aria-required="true"`
- Global errors in `role="alert"` live region
- Tab order follows visual order (CSS grid does not reorder DOM)
- Focus trap in modals (file upload dialogs)

---

## 11. Performance Optimization

### Decision: React 18 Concurrent Features + Virtualization

**Rationale**:
- React Hook Form already optimizes re-renders with field subscriptions
- Use React 18 `useTransition` for non-blocking schema parsing
- Virtualize large option lists with `react-window` (avoid rendering 10K+ DOM nodes)
- Code-split field components with `React.lazy` (load only used field types)

**Alternatives Considered**:
- **Virtualization for form fields**: Not needed (100 fields renders fast enough)
- **Web Workers for validation**: Overhead not worth it for field-level validation
- **useDeferredValue**: Similar to useTransition but less control

**Implementation Notes**:
- Lazy load field components: `const MaskedField = React.lazy(() => import('./MaskedField'))`
- Use `react-window` FixedSizeList in Select dropdowns when `options.length > 100`
- Debounce search input (300ms per spec) to reduce option fetch calls
- Memoize expensive computations: schema parsing, Zod schema generation, dependency graphs

---

## 12. Testing Strategy

### Decision: Vitest + React Testing Library + Playwright

**Rationale**:
- **Vitest**: Fast (ESM-native, Vite-based), Jest-compatible API, better TypeScript DX
- **React Testing Library**: Encourages accessible, user-centric tests
- **Playwright**: Modern E2E framework, great debugging, supports all browsers

**Alternatives Considered**:
- **Jest**: Slower than Vitest, requires more config for ESM/TypeScript
- **Enzyme**: Deprecated, encourages implementation detail testing
- **Cypress**: Good but Playwright has better API, faster, supports more browsers

**Implementation Notes**:
- Unit tests: Individual field components, validators, utilities (80% coverage target)
- Integration tests: Full form flows, conditional logic, dynamic options (key user journeys)
- E2E tests: Critical paths in real browser (create form, edit form, wizard completion)
- Mock callbacks in tests with predictable responses
- Test accessibility with `jest-axe` or `@axe-core/playwright`

---

## 13. Bundle Size Optimization

### Decision: Next.js Tree Shaking + Dynamic Imports

**Rationale**:
- Target: Core component <50KB gzipped
- Next.js automatically tree-shakes unused code
- Dynamic imports for field types and layout components
- Tailwind CSS purge removes unused styles

**Implementation Notes**:
- Analyze bundle: `next build --analyze`
- Dynamic import field types based on schema field usage
- Externalize React Hook Form, Zod, Tailwind in library build
- Use `@next/bundle-analyzer` to monitor regressions

---

## 14. TypeScript Configuration

### Decision: Strict Mode + Path Aliases

**Rationale**:
- Strict mode catches errors early (null checks, implicit any, etc.)
- Path aliases improve import readability: `@/components` vs `../../../components`

**Implementation Notes**:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    }
  }
}
```

---

## 15. Change Tracking (Dirty Fields)

### Decision: React Hook Form `formState.dirtyFields`

**Rationale**:
- Built-in to React Hook Form
- Automatically tracks which fields changed from initial values
- Deep comparison for nested objects/arrays
- No custom implementation needed

**Implementation Notes**:
- Initialize form with `defaultValues` from `onLoad` callback or prop
- Access `formState.dirtyFields` on submit
- Convert to flat map for callback: `{ "contact.email": true, "fees": true }`

---

## Summary Table

| Decision Area | Choice | Key Reason |
|---------------|--------|------------|
| Form State | React Hook Form | Performance with many fields, TypeScript support |
| Schema Validation | Zod | TypeScript-first, excellent DX, composable |
| UI Components | shadcn/ui | Customizable, accessible, Tailwind-based |
| Conditional Logic | Custom Evaluator | Security, simplicity, performance |
| Remote Options | TanStack Query | Built-in caching, pagination, TypeScript support |
| File Upload | Custom Component | Fine control, callback contract fit |
| Input Masking | react-input-mask | Lightweight, UK-specific mask support |
| Calculated Fields | Custom AST Evaluator | Security (no eval), sufficient for V1 |
| Layout | Tailwind Grid + Custom | Schema-driven, responsive, accessible |
| Accessibility | Radix UI + ARIA | WCAG 2.1 AA, keyboard navigation |
| Performance | React 18 + Virtualization | Concurrent rendering, large lists |
| Testing | Vitest + RTL + Playwright | Fast, modern, comprehensive coverage |
| Bundle Size | Tree Shaking + Dynamic Imports | <50KB target, lazy loading |
| TypeScript | Strict Mode + Path Aliases | Type safety, clean imports |
| Change Tracking | RHF dirtyFields | Built-in, no custom code needed |

---

## Open Questions

None - all technical decisions resolved for Phase 1.
