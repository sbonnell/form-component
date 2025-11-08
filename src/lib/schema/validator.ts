/**
 * Zod schema validator
 * 
 * Converts JSON Schema field definitions to Zod validation schemas
 * for runtime validation with React Hook Form.
 */

import { z } from 'zod';
import type { FieldDefinition } from '@/types/schema';

/**
 * Convert field definition to Zod schema
 */
export function fieldToZod(field: FieldDefinition): z.ZodTypeAny {
  let schema: z.ZodTypeAny;

  // Base schema by type
  switch (field.type) {
    case 'string':
      schema = z.string();
      
      if (field.minLength !== undefined) {
        schema = (schema as z.ZodString).min(field.minLength, `Minimum length is ${field.minLength}`);
      }
      if (field.maxLength !== undefined) {
        schema = (schema as z.ZodString).max(field.maxLength, `Maximum length is ${field.maxLength}`);
      }
      if (field.pattern) {
        schema = (schema as z.ZodString).regex(new RegExp(field.pattern), 'Invalid format');
      }
      if (field.format === 'email') {
        schema = (schema as z.ZodString).email('Invalid email address');
      }
      if (field.format === 'uri') {
        schema = (schema as z.ZodString).url('Invalid URL');
      }
      if (field.enum) {
        schema = z.enum(field.enum as [string, ...string[]]);
      }
      break;

    case 'number':
    case 'integer':
      schema = field.type === 'integer' ? z.number().int('Must be an integer') : z.number();
      
      if (field.minimum !== undefined) {
        schema = (schema as z.ZodNumber).min(field.minimum, `Minimum value is ${field.minimum}`);
      }
      if (field.maximum !== undefined) {
        schema = (schema as z.ZodNumber).max(field.maximum, `Maximum value is ${field.maximum}`);
      }
      if (field.exclusiveMinimum !== undefined) {
        schema = (schema as z.ZodNumber).gt(field.exclusiveMinimum, `Must be greater than ${field.exclusiveMinimum}`);
      }
      if (field.exclusiveMaximum !== undefined) {
        schema = (schema as z.ZodNumber).lt(field.exclusiveMaximum, `Must be less than ${field.exclusiveMaximum}`);
      }
      break;

    case 'boolean':
      schema = z.boolean();
      break;

    case 'array':
      const itemSchema = field.items ? fieldToZod(field.items) : z.any();
      schema = z.array(itemSchema);
      
      if (field.minItems !== undefined) {
        schema = (schema as z.ZodArray<any>).min(field.minItems, `Minimum ${field.minItems} items required`);
      }
      if (field.maxItems !== undefined) {
        schema = (schema as z.ZodArray<any>).max(field.maxItems, `Maximum ${field.maxItems} items allowed`);
      }
      break;

    case 'object':
      if (field.properties) {
        const shape: Record<string, z.ZodTypeAny> = {};
        for (const [key, prop] of Object.entries(field.properties)) {
          shape[key] = fieldToZod(prop);
        }
        schema = z.object(shape);
      } else {
        schema = z.record(z.any());
      }
      break;

    case 'null':
      schema = z.null();
      break;

    default:
      schema = z.any();
  }

  // Make optional if not required (will be handled at form level)
  // Individual fields are always optional by default
  schema = schema.optional();

  return schema;
}

/**
 * Convert entire schema to Zod object schema
 */
export function schemaToZod(
  properties: Record<string, FieldDefinition>,
  required: string[] = []
): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, field] of Object.entries(properties)) {
    let fieldSchema = fieldToZod(field);
    
    // Apply required constraint
    if (required.includes(key) && !field.readOnly) {
      // Remove optional and add required
      if (fieldSchema instanceof z.ZodOptional) {
        fieldSchema = fieldSchema.unwrap();
      }
    }
    
    shape[key] = fieldSchema;
  }

  return z.object(shape);
}

/**
 * Create dynamic Zod schema that adjusts based on conditional rules
 * This is a placeholder - actual implementation in useValidation hook
 */
export function createDynamicSchema(
  properties: Record<string, FieldDefinition>,
  requiredFields: Set<string>
): z.ZodObject<any> {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const [key, field] of Object.entries(properties)) {
    let fieldSchema = fieldToZod(field);
    
    if (requiredFields.has(key) && !field.readOnly) {
      if (fieldSchema instanceof z.ZodOptional) {
        fieldSchema = fieldSchema.unwrap();
      }
    }
    
    shape[key] = fieldSchema;
  }

  return z.object(shape);
}
