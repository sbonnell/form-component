# API Contracts: Schema-Driven Form Component V1

This directory contains TypeScript interface definitions for all callback contracts and data structures used by the form component.

## Files

- `schema.types.ts` - JSON Schema + custom extensions type definitions
- `callbacks.types.ts` - All callback function signatures
- `field.types.ts` - Field configuration and UI types
- `validation.types.ts` - Validation and error types
- `layout.types.ts` - Layout and navigation types

## Usage

These types should be imported by both:
1. The form component library (to type-check internal implementation)
2. Consumer applications (to implement callbacks with proper types)

## Contract Stability

- **Major version changes**: Breaking changes to callback signatures or required fields
- **Minor version changes**: Additive changes (new optional fields, new callback types)
- **Patch version changes**: Documentation or non-breaking clarifications

All types are exported from the main package entry point for consumer convenience:

```typescript
import type { 
  FormSchema, 
  OnLoadCallback, 
  OnSubmitCallback,
  FieldDefinition 
} from '@your-org/schema-form';
```
