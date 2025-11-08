/**
 * Validation types and error handling
 */

export interface ValidationError {
  /** Field path (dot-notation) */
  field: string;
  
  /** Error message */
  message: string;
  
  /** Validation rule that failed */
  rule?: string;
}

export interface ValidationResult {
  /** Whether validation passed */
  isValid: boolean;
  
  /** Array of validation errors */
  errors: ValidationError[];
  
  /** Field-specific error map */
  fieldErrors: Record<string, string>;
}

export type ValidationRule = {
  /** Rule name */
  name: string;
  
  /** Validation function */
  validate: (value: any, context?: any) => boolean | Promise<boolean>;
  
  /** Error message template */
  message: string | ((value: any, context?: any) => string);
};
