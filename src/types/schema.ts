/**
 * JSON Schema + Custom Extensions Type Definitions
 * 
 * Defines the complete schema structure for schema-driven forms.
 * Based on JSON Schema 2020-12 with custom UI, logic, and layout extensions.
 */

export interface FormSchema {
  /** JSON Schema version URI */
  $schema: string;
  
  /** Form metadata and configuration */
  meta: FormMeta;
  
  /** Root type must be "object" */
  type: 'object';
  
  /** Field definitions keyed by field name */
  properties: Record<string, FieldDefinition>;
  
  /** Array of required field keys */
  required?: string[];
  
  /** Native JSON Schema conditionals */
  allOf?: JSONSchemaConditional[];
  if?: JSONSchemaConditional;
  then?: Partial<FormSchema>;
  else?: Partial<FormSchema>;
  
  /** Global UI configuration */
  ui?: GlobalUIConfiguration;
  
  /** Conditional and calculated field rules */
  logic?: LogicConfiguration;
  
  /** Callback declarations for data loading */
  dataSources?: DataSourceConfiguration;
  
  /** File upload constraints */
  uploads?: Record<string, UploadConstraint>;
  
  /** Layout and navigation structure */
  layout?: LayoutConfiguration;
}

export interface FormMeta {
  /** Unique schema identifier (kebab-case) */
  id: string;
  
  /** Semver version (e.g., "1.2.0") */
  version: string;
  
  /** Human-readable form title */
  title: string;
  
  /** Form operation mode */
  mode: 'create' | 'edit';
  
  /** Form purpose description */
  description?: string;
  
  /** Schema creation timestamp */
  createdAt?: string;
  
  /** Last schema update timestamp */
  updatedAt?: string;
}

export interface FieldDefinition {
  /** Data type */
  type: 'string' | 'number' | 'integer' | 'boolean' | 'object' | 'array' | 'null';
  
  /** Field label displayed to user */
  title: string;
  
  /** Help text or tooltip content */
  description?: string;
  
  /** Default value when creating new form */
  default?: any;
  
  /** Allowed values for the field */
  enum?: any[];
  
  /** Format hint: email, date, time, uri, etc. */
  format?: string;
  
  /** Regex pattern for string validation */
  pattern?: string;
  
  /** Minimum string length */
  minLength?: number;
  
  /** Maximum string length */
  maxLength?: number;
  
  /** Minimum numeric value (inclusive) */
  minimum?: number;
  
  /** Maximum numeric value (inclusive) */
  maximum?: number;
  
  /** Minimum numeric value (exclusive) */
  exclusiveMinimum?: number;
  
  /** Maximum numeric value (exclusive) */
  exclusiveMaximum?: number;
  
  /** Minimum array length */
  minItems?: number;
  
  /** Maximum array length */
  maxItems?: number;
  
  /** Array items must be unique */
  uniqueItems?: boolean;
  
  /** Whether field is read-only */
  readOnly?: boolean;
  
  /** UI-specific configuration */
  ui?: FieldUIConfiguration;
  
  /** Nested object fields (when type is "object") */
  properties?: Record<string, FieldDefinition>;
  
  /** Required nested fields (when type is "object") */
  required?: string[];
  
  /** Array item schema (when type is "array") */
  items?: FieldDefinition;
}

export interface FieldUIConfiguration {
  /** UI widget type */
  widget?: WidgetType;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Additional help text below field */
  help?: string;
  
  /** Grid column span (1-12) */
  width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

  /** Column offset - number of columns to skip before field (1-11) */
  offset?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

  /** Display order within section */
  order?: number;
  
  /** Whether object/array field should be collapsed by default */
  collapsed?: boolean;
  
  /** Input mask pattern (for masked inputs) */
  mask?: string;
  
  /** Currency code for currency fields (ISO 4217) */
  currency?: string;
  
  /** Decimal places for numbers/currency */
  decimalScale?: number;
  
  /** Thousand separator character */
  thousandSeparator?: string;
  
  /** Condition to hide field */
  hiddenWhen?: ConditionalRule;
  
  /** Condition to make field required */
  requiredWhen?: ConditionalRule;
  
  /** Condition to make field read-only */
  readOnlyWhen?: ConditionalRule;
  
  /** Data source name for select options */
  optionsSource?: string;
  
  /** Field keys this field depends on */
  dependsOn?: string[];
  
  /** Upload configuration for file fields */
  upload?: UploadFieldConfig;
}

export type WidgetType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'currency'
  | 'date'
  | 'time'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'radio'
  | 'checkbox'
  | 'toggle'
  | 'file'
  | 'array'
  | 'object'
  | 'masked'
  | 'calculated';

export interface ConditionalRule {
  /** Field path to evaluate (supports dot-notation) */
  field?: string;
  
  /** Comparison operator */
  operator?: ConditionOperator;
  
  /** Comparison value */
  value?: any;
  
  /** All sub-rules must be true (AND logic) */
  and?: ConditionalRule[];
  
  /** Any sub-rule must be true (OR logic) */
  or?: ConditionalRule[];
}

export type ConditionOperator =
  | 'equals'
  | 'notEquals'
  | 'in'
  | 'notIn'
  | 'greaterThan'
  | 'greaterThanOrEqual'
  | 'lessThan'
  | 'lessThanOrEqual'
  | 'isEmpty'
  | 'isNotEmpty';

export interface GlobalUIConfiguration {
  /** Global theme configuration */
  theme?: {
    /** Primary color */
    primaryColor?: string;
    /** Error color */
    errorColor?: string;
    /** Success color */
    successColor?: string;
  };
  
  /** Global text configuration */
  messages?: {
    /** Global error message */
    globalError?: string;
    /** Submit button text */
    submitText?: string;
    /** Reset button text */
    resetText?: string;
  };
}

export interface LogicConfiguration {
  /** Calculated field definitions */
  calculated?: CalculatedField[];
}

export interface CalculatedField {
  /** Field path where result is stored */
  target: string;
  
  /** Field paths used in formula */
  dependsOn: string[];
  
  /** JavaScript-like expression string */
  formula: string;
}

export interface DataSourceConfiguration {
  /** Initial data load callback */
  onLoad?: {
    name: string;
  };
  
  /** Dynamic option source callbacks */
  options?: Array<{
    name: string;
  }>;
}

export interface UploadConstraint {
  /** Upload callback name */
  callback: string;
  
  /** Maximum files allowed */
  maxFiles?: number;
  
  /** Maximum size per file in MB */
  maxSizeMB?: number;
  
  /** Allowed MIME types or extensions */
  accept?: string[];
}

export interface UploadFieldConfig {
  /** Upload callback name */
  callback: string;
  
  /** Maximum files allowed */
  maxFiles?: number;
  
  /** Maximum size per file in MB */
  maxSizeMB?: number;
  
  /** Allowed MIME types or extensions */
  accept?: string[];
}

export interface LayoutConfiguration {
  /** Grid layout definition */
  grid?: GridLayout[];
  
  /** Groups/fieldsets */
  groups?: GroupLayout[];
  
  /** Tab navigation */
  tabs?: TabLayout[];
  
  /** Wizard/stepper navigation */
  wizard?: WizardLayout;
}

export interface GridLayout {
  /** Row of fields with widths */
  row: Array<{
    field: string;
    width: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  }>;
}

export interface GroupLayout {
  /** Group heading */
  title?: string;
  
  /** Group description */
  description?: string;
  
  /** Field keys in this group */
  fields: string[];
}

export interface TabLayout {
  /** Tab title */
  title: string;
  
  /** Field keys in this tab */
  fields: string[];
  
  /** Optional icon identifier */
  icon?: string;
}

export interface WizardLayout {
  /** Array of step definitions */
  steps: WizardStep[];
}

export interface WizardStep {
  /** Step title */
  title: string;
  
  /** Step description */
  description?: string;
  
  /** Field keys in this step */
  fields: string[];
  
  /** 
   * Allow navigation away from this step even if invalid
   * If false (default), validation must pass before proceeding
   * If true, user can navigate to other steps with incomplete data
   */
  allowIncomplete?: boolean;
}

export interface JSONSchemaConditional {
  if?: {
    properties?: Record<string, { const?: any; enum?: any[] }>;
    required?: string[];
  };
  then?: Partial<FieldDefinition>;
  else?: Partial<FieldDefinition>;
}
