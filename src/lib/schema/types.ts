/**
 * Schema type definitions for internal use
 */

import type { FormSchema, FieldDefinition } from '@/types/schema';

export interface ParsedSchema {
  /** Original schema */
  raw: FormSchema;
  
  /** Flat list of all field configurations */
  fields: ParsedField[];
  
  /** Field map by path for quick lookup */
  fieldMap: Map<string, ParsedField>;
  
  /** Required field paths */
  requiredFields: Set<string>;
  
  /** Fields with conditional visibility */
  conditionalFields: Set<string>;
  
  /** Fields with calculated values */
  calculatedFields: Set<string>;
}

export interface ParsedField {
  /** Field unique path (dot-notation) */
  path: string;
  
  /** Field key (last segment of path) */
  key: string;
  
  /** Parent path (if nested) */
  parentPath?: string;
  
  /** Original field definition */
  definition: FieldDefinition;
  
  /** Computed widget type */
  widget: string;
  
  /** Whether initially required */
  isRequired: boolean;
  
  /** Whether initially visible */
  isVisible: boolean;
  
  /** Whether read-only */
  isReadOnly: boolean;
  
  /** Nesting level (0 for root) */
  level: number;
}
