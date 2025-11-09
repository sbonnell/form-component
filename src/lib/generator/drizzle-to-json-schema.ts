/**
 * Convert Drizzle table schema to JSON Schema format for SchemaForm
 */

import type { FormSchema } from "@/types/schema";

/**
 * Get JSON Schema type from Drizzle column
 */
function getJsonSchemaType(column: any): "string" | "number" | "integer" | "boolean" {
  const columnType = column.columnType?.toLowerCase() || "";
  
  // Check data type
  if (columnType.includes("integer")) return "integer";
  if (columnType.includes("real") || columnType.includes("numeric")) return "number";
  if (columnType.includes("text")) return "string";
  if (columnType.includes("blob")) return "string";
  
  return "string"; // default
}

/**
 * Get widget type from column definition
 */
function getWidgetType(column: any): string {
  const columnName = column.name?.toLowerCase() || "";
  const columnType = column.columnType?.toLowerCase() || "";
  
  // Check for enum
  if (column.enumValues && Array.isArray(column.enumValues)) {
    return "select";
  }
  
  // Email detection
  if (columnName.includes("email")) {
    return "text";
  }
  
  // Date detection
  if (columnName.includes("date") || columnName.includes("created_at") || columnName.includes("updated_at")) {
    return "date";
  }
  
  // Price/Amount detection
  if (columnName.includes("price") || columnName.includes("amount")) {
    return "currency";
  }
  
  // Description/Notes - use textarea
  if (columnName.includes("description") || columnName.includes("notes") || columnName.includes("comment")) {
    return "textarea";
  }
  
  // Numeric types
  if (columnType.includes("integer") || columnType.includes("real") || columnType.includes("numeric")) {
    return "number";
  }
  
  return "text";
}

/**
 * Get field label from column name
 */
function getFieldLabel(columnName: string): string {
  // Convert snake_case to Title Case
  return columnName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Check if field should be excluded from form
 */
function shouldExcludeField(columnName: string): boolean {
  const excludedFields = ['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt'];
  return excludedFields.includes(columnName);
}

/**
 * Convert Drizzle table to JSON Schema for SchemaForm
 */
export function drizzleTableToFormSchema(
  table: any,
  tableName: string,
  mode: "create" | "edit" = "create"
): FormSchema {
  const properties: Record<string, any> = {};
  const required: string[] = [];
  
  // Access the table columns
  const columns = table ? Object.entries(table) : [];
  
  for (const [, column] of columns) {
    const col = column as any;
    
    // Skip if not a column definition
    if (!col || typeof col !== 'object' || !col.name) continue;
    
    const dbColumnName = col.name;
    
    // Skip excluded fields
    if (shouldExcludeField(dbColumnName)) continue;
    
    const jsonType = getJsonSchemaType(col);
    const widget = getWidgetType(col);
    
    // Build property definition
    const property: any = {
      type: jsonType,
      title: getFieldLabel(dbColumnName),
      ui: {
        widget: widget,
      },
    };
    
    // Add description
    property.description = `Enter ${getFieldLabel(dbColumnName).toLowerCase()}`;
    
    // Add enum values
    if (col.enumValues && Array.isArray(col.enumValues)) {
      property.enum = col.enumValues;
    }
    
    // Add default value
    if (col.default !== undefined && col.default !== null) {
      property.default = col.default;
    }
    
    // Add format for specific fields
    if (widget === "date") {
      property.format = "date";
    }
    
    // Add minimum for numbers
    if (jsonType === "number" || jsonType === "integer") {
      if (dbColumnName.includes("price") || dbColumnName.includes("amount")) {
        property.minimum = 0;
      }
    }
    
    // Add to required if notNull and no default
    if (col.notNull && !col.hasDefault && mode === "create") {
      required.push(dbColumnName);
    }
    
    properties[dbColumnName] = property;
  }
  
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    meta: {
      id: `${tableName}-form`,
      version: "1.0.0",
      title: getFieldLabel(tableName),
      mode: mode,
      description: `${getFieldLabel(tableName)} form`,
    },
    type: "object",
    required: required,
    properties: properties,
  };
}
