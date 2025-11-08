/**
 * JSON Schema parser
 * 
 * Parses FormSchema into internal representation with flat field list,
 * computed widget types, and extracted conditional/calculated fields.
 */

import type { FormSchema, FieldDefinition, WidgetType } from '@/types/schema';
import type { ParsedSchema, ParsedField } from './types';

/**
 * Infer widget type from field definition
 */
function inferWidget(field: FieldDefinition): WidgetType {
  // Explicit widget override
  if (field.ui?.widget) {
    return field.ui.widget;
  }

  // Infer from format
  if (field.format) {
    const formatMap: Record<string, WidgetType> = {
      email: 'text',
      uri: 'text',
      'uri-reference': 'text',
      date: 'date',
      time: 'time',
      'date-time': 'datetime',
    };
    if (formatMap[field.format]) {
      return formatMap[field.format];
    }
  }

  // Infer from type
  switch (field.type) {
    case 'string':
      if (field.enum) return 'select';
      return 'text';
    case 'number':
    case 'integer':
      return field.ui?.currency ? 'currency' : 'number';
    case 'boolean':
      return 'checkbox';
    case 'array':
      return 'array';
    case 'object':
      return 'object';
    default:
      return 'text';
  }
}

/**
 * Recursively parse field definitions into flat list
 */
function parseFields(
  properties: Record<string, FieldDefinition>,
  requiredKeys: string[] = [],
  parentPath = '',
  level = 0
): ParsedField[] {
  const fields: ParsedField[] = [];

  for (const [key, definition] of Object.entries(properties)) {
    const path = parentPath ? `${parentPath}.${key}` : key;
    const widget = inferWidget(definition);
    const isRequired = requiredKeys.includes(key);
    const isVisible = !definition.ui?.hiddenWhen;
    const isReadOnly = definition.readOnly || false;

    const field: ParsedField = {
      path,
      key,
      parentPath: parentPath || undefined,
      definition,
      widget,
      isRequired,
      isVisible,
      isReadOnly,
      level,
    };

    fields.push(field);

    // Parse nested object fields
    if (definition.type === 'object' && definition.properties) {
      const nestedFields = parseFields(
        definition.properties,
        definition.required || [],
        path,
        level + 1
      );
      fields.push(...nestedFields);
    }

    // Parse array item fields (if object type)
    if (definition.type === 'array' && definition.items?.type === 'object' && definition.items.properties) {
      const itemPath = `${path}[0]`;
      const itemFields = parseFields(
        definition.items.properties,
        definition.items.required || [],
        itemPath,
        level + 1
      );
      fields.push(...itemFields);
    }
  }

  return fields;
}

/**
 * Parse FormSchema into internal representation
 */
export function parseSchema(schema: FormSchema): ParsedSchema {
  const fields = parseFields(schema.properties, schema.required || []);
  const fieldMap = new Map(fields.map((f) => [f.path, f]));
  const requiredFields = new Set(fields.filter((f) => f.isRequired).map((f) => f.path));
  
  const conditionalFields = new Set(
    fields
      .filter((f) => f.definition.ui?.hiddenWhen || f.definition.ui?.requiredWhen || f.definition.ui?.readOnlyWhen)
      .map((f) => f.path)
  );
  
  const calculatedFields = new Set(
    (schema.logic?.calculated || []).map((calc) => calc.target)
  );

  return {
    raw: schema,
    fields,
    fieldMap,
    requiredFields,
    conditionalFields,
    calculatedFields,
  };
}

/**
 * Get default values from schema
 */
export function getDefaultValues(schema: FormSchema): Record<string, any> {
  const defaults: Record<string, any> = {};

  function extractDefaults(properties: Record<string, FieldDefinition>, prefix = '') {
    for (const [key, field] of Object.entries(properties)) {
      const path = prefix ? `${prefix}.${key}` : key;

      if (field.default !== undefined) {
        defaults[path] = field.default;
      } else if (field.type === 'boolean') {
        // Boolean fields default to false if not explicitly set
        defaults[path] = false;
      }

      // Recurse for nested objects
      if (field.type === 'object' && field.properties) {
        extractDefaults(field.properties, path);
      }
    }
  }

  extractDefaults(schema.properties);
  return defaults;
}
