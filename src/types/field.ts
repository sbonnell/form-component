/**
 * Field configuration and runtime types
 */

import type { FieldDefinition, WidgetType } from './schema';

export interface FieldConfig extends FieldDefinition {
  /** Field unique key */
  key: string;
  
  /** Full path including nesting (dot-notation) */
  path: string;
  
  /** Parent field path (if nested) */
  parentPath?: string;
  
  /** Computed widget type */
  widget: WidgetType;
  
  /** Whether field is currently visible */
  isVisible: boolean;
  
  /** Whether field is currently required */
  isRequired: boolean;
  
  /** Whether field is currently read-only */
  isReadOnly: boolean;
}

export interface FieldState {
  /** Current field value */
  value: any;
  
  /** Whether field has been touched */
  touched: boolean;
  
  /** Whether field has been modified */
  dirty: boolean;
  
  /** Validation error message */
  error?: string;
  
  /** Whether field is valid */
  isValid: boolean;
}
