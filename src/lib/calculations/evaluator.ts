/**
 * Calculated Field Evaluator
 * 
 * Evaluates formulas for calculated fields.
 * Supports basic arithmetic, field references, and common functions.
 */

/**
 * Evaluate a calculated field formula
 * 
 * @param formula - Formula string (e.g., "price * quantity")
 * @param formValues - Current form values
 * @param dependsOn - Field paths used in formula
 * @returns Calculated result, or undefined if formula cannot be evaluated
 */
export function evaluateFormula(
  formula: string,
  formValues: Record<string, unknown>,
  dependsOn: string[]
): number | string | boolean | undefined {
  try {
    // Get values for dependencies
    const context: Record<string, unknown> = {};
    
    for (const fieldPath of dependsOn) {
      const value = getNestedValue(formValues, fieldPath);
      // Use last segment of path as variable name (e.g., "price" from "order.price")
      const varName = fieldPath.split('.').pop() || fieldPath;
      context[varName] = value;
    }
    
    // Check if all dependencies have valid values
    const hasAllValues = dependsOn.every(path => {
      const varName = path.split('.').pop() || path;
      const value = context[varName];
      // Allow 0 as a valid number, but reject undefined, null, and empty strings
      if (value === 0) return true;
      return value !== undefined && value !== null && value !== '';
    });
    
    if (!hasAllValues) {
      return undefined;
    }
    
    // Evaluate formula in safe context
    const result = evaluateExpression(formula, context);
    
    // Return undefined if result is NaN (invalid calculation)
    if (typeof result === 'number' && isNaN(result)) {
      return undefined;
    }
    
    return result;
  } catch (error) {
    console.warn('Formula evaluation failed:', error);
    return undefined;
  }
}

/**
 * Get nested value from object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return undefined;
    }
    
    if (typeof current === 'object' && !Array.isArray(current)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Safely evaluate a formula expression
 * 
 * This is a simplified evaluator that supports:
 * - Basic arithmetic: +, -, *, /, %
 * - Comparison: <, >, <=, >=, ==, !=
 * - Logical: &&, ||
 * - Functions: min, max, round, floor, ceil, abs, sqrt
 * - Ternary: condition ? value1 : value2
 * 
 * @param expression - Formula expression
 * @param context - Variable values
 * @returns Evaluated result
 */
function evaluateExpression(
  expression: string,
  context: Record<string, unknown>
): number | string | boolean | undefined {
  // Replace variable names with their values
  let processed = expression;
  
  // Sort keys by length (longest first) to avoid partial replacements
  const sortedKeys = Object.keys(context).sort((a, b) => b.length - a.length);
  
  for (const key of sortedKeys) {
    const value = context[key];
    
    // Coerce string numbers to actual numbers
    let numericValue: number | undefined;
    
    if (typeof value === 'number') {
      numericValue = value;
    } else if (typeof value === 'string' && value.trim() !== '') {
      const parsed = parseFloat(value);
      if (!isNaN(parsed)) {
        numericValue = parsed;
      }
    }
    
    // Replace if we have a numeric value
    if (numericValue !== undefined) {
      // Use word boundaries to avoid partial matches
      const regex = new RegExp(`\\b${escapeRegExp(key)}\\b`, 'g');
      processed = processed.replace(regex, String(numericValue));
    }
  }
  
  // Add safe math functions
  const safeContext = {
    min: Math.min,
    max: Math.max,
    round: Math.round,
    floor: Math.floor,
    ceil: Math.ceil,
    abs: Math.abs,
    sqrt: Math.sqrt,
  };
  
  // Build safe evaluation function
  const contextKeys = Object.keys(safeContext);
  const contextValues = Object.values(safeContext);
  
  try {
    // Create a function with math context and evaluate
    const fn = new Function(...contextKeys, `'use strict'; return (${processed});`);
    const result = fn(...contextValues);
    
    return result;
  } catch (error) {
    throw new Error(`Invalid formula: ${expression}`);
  }
}

/**
 * Escape special regex characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract field dependencies from a formula
 * 
 * This is a simple heuristic that looks for variable-like tokens.
 * For production use, consider using a proper expression parser.
 * 
 * @param formula - Formula string
 * @returns Array of potential field names
 */
export function extractDependencies(formula: string): string[] {
  // Match variable-like tokens (alphanumeric + underscore)
  const matches = formula.match(/\b[a-zA-Z_][a-zA-Z0-9_]*\b/g) || [];
  
  // Filter out known functions and keywords
  const reserved = new Set([
    'min', 'max', 'round', 'floor', 'ceil', 'abs', 'sqrt',
    'true', 'false', 'null', 'undefined',
  ]);
  
  return Array.from(new Set(matches.filter(token => !reserved.has(token))));
}

/**
 * Validate a formula for syntax errors
 * 
 * @param formula - Formula to validate
 * @returns true if formula is valid, false otherwise
 */
export function validateFormula(formula: string): boolean {
  try {
    // Try to parse as a function body
    new Function(`'use strict'; return (${formula});`);
    return true;
  } catch {
    return false;
  }
}
