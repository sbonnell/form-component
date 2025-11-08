/**
 * Conditional Logic Evaluator
 * 
 * Evaluates conditional rules for hiddenWhen, requiredWhen, and readOnlyWhen.
 * Supports operators: equals, notEquals, in, notIn, greaterThan, lessThan, etc.
 * Supports complex logic with and/or combinators.
 */

import type { ConditionalRule, ConditionOperator } from '@/types/schema';

/**
 * Evaluate a conditional rule against current form values
 * 
 * @param rule - The conditional rule to evaluate
 * @param formValues - Current form values (Record<string, unknown>)
 * @returns true if condition matches, false otherwise
 */
export function evaluateCondition(
  rule: ConditionalRule | undefined,
  formValues: Record<string, unknown>
): boolean {
  // No rule means no condition to evaluate
  if (!rule) {
    return false;
  }

  // AND logic: all sub-rules must be true
  if (rule.and && rule.and.length > 0) {
    return rule.and.every(subRule => evaluateCondition(subRule, formValues));
  }

  // OR logic: any sub-rule must be true
  if (rule.or && rule.or.length > 0) {
    return rule.or.some(subRule => evaluateCondition(subRule, formValues));
  }

  // Single field comparison
  if (rule.field && rule.operator) {
    const fieldValue = getNestedValue(formValues, rule.field);
    return evaluateOperator(rule.operator, fieldValue, rule.value);
  }

  // Invalid rule structure
  return false;
}

/**
 * Get nested value from object using dot notation
 * 
 * @param obj - Object to traverse
 * @param path - Dot-separated path (e.g., "address.city")
 * @returns Value at path, or undefined if not found
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
 * Evaluate a comparison operator
 * 
 * @param operator - Comparison operator
 * @param fieldValue - Current field value
 * @param compareValue - Value to compare against
 * @returns true if comparison matches
 */
function evaluateOperator(
  operator: ConditionOperator,
  fieldValue: unknown,
  compareValue: unknown
): boolean {
  switch (operator) {
    case 'equals':
      return fieldValue === compareValue;

    case 'notEquals':
      return fieldValue !== compareValue;

    case 'in':
      if (!Array.isArray(compareValue)) {
        return false;
      }
      return compareValue.includes(fieldValue);

    case 'notIn':
      if (!Array.isArray(compareValue)) {
        return true;
      }
      return !compareValue.includes(fieldValue);

    case 'greaterThan':
      if (typeof fieldValue !== 'number' || typeof compareValue !== 'number') {
        return false;
      }
      return fieldValue > compareValue;

    case 'greaterThanOrEqual':
      if (typeof fieldValue !== 'number' || typeof compareValue !== 'number') {
        return false;
      }
      return fieldValue >= compareValue;

    case 'lessThan':
      if (typeof fieldValue !== 'number' || typeof compareValue !== 'number') {
        return false;
      }
      return fieldValue < compareValue;

    case 'lessThanOrEqual':
      if (typeof fieldValue !== 'number' || typeof compareValue !== 'number') {
        return false;
      }
      return fieldValue <= compareValue;

    case 'isEmpty':
      if (typeof fieldValue === 'string') {
        return fieldValue.trim() === '';
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.length === 0;
      }
      return fieldValue === null || fieldValue === undefined;

    case 'isNotEmpty':
      if (typeof fieldValue === 'string') {
        return fieldValue.trim() !== '';
      }
      if (Array.isArray(fieldValue)) {
        return fieldValue.length > 0;
      }
      return fieldValue !== null && fieldValue !== undefined;

    default:
      // Unknown operator
      return false;
  }
}

/**
 * Determine if a field should be hidden based on its hiddenWhen rule
 * 
 * @param hiddenWhen - Conditional rule from field.ui.hiddenWhen
 * @param formValues - Current form values
 * @returns true if field should be hidden
 */
export function isFieldHidden(
  hiddenWhen: ConditionalRule | undefined,
  formValues: Record<string, unknown>
): boolean {
  return evaluateCondition(hiddenWhen, formValues);
}

/**
 * Determine if a field should be required based on its requiredWhen rule
 * 
 * @param requiredWhen - Conditional rule from field.ui.requiredWhen
 * @param formValues - Current form values
 * @returns true if field should be required
 */
export function isFieldRequired(
  requiredWhen: ConditionalRule | undefined,
  formValues: Record<string, unknown>
): boolean {
  return evaluateCondition(requiredWhen, formValues);
}

/**
 * Determine if a field should be read-only based on its readOnlyWhen rule
 * 
 * @param readOnlyWhen - Conditional rule from field.ui.readOnlyWhen
 * @param formValues - Current form values
 * @returns true if field should be read-only
 */
export function isFieldReadOnly(
  readOnlyWhen: ConditionalRule | undefined,
  formValues: Record<string, unknown>
): boolean {
  return evaluateCondition(readOnlyWhen, formValues);
}
