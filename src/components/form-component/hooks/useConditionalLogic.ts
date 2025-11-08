/**
 * useConditionalLogic Hook
 * 
 * Manages conditional visibility, required state, and read-only state for form fields.
 * Watches form values and re-evaluates conditions when dependencies change.
 */

import { useMemo } from 'react';
import { useWatch, type Control } from 'react-hook-form';
import type { FieldDefinition, ConditionalRule } from '@/types/schema';
import { isFieldHidden, isFieldRequired, isFieldReadOnly } from '@/lib/conditional-logic/evaluator';

interface ConditionalLogicResult {
  /** Map of field names to their hidden state */
  hiddenFields: Set<string>;
  
  /** Map of field names to their conditionally required state */
  conditionallyRequiredFields: Set<string>;
  
  /** Map of field names to their read-only state */
  readOnlyFields: Set<string>;
}

interface UseConditionalLogicParams {
  /** Form field definitions */
  properties: Record<string, FieldDefinition>;
  
  /** React Hook Form control */
  control: Control<any>;
  
  /** Base required fields from schema */
  baseRequiredFields?: string[];
}

/**
 * Hook to evaluate conditional logic for all fields
 * 
 * @param params - Configuration with properties and control
 * @returns Sets of hidden, required, and read-only field names
 */
export function useConditionalLogic({
  properties,
  control,
  baseRequiredFields = [],
}: UseConditionalLogicParams): ConditionalLogicResult {
  // Watch all form values for conditional evaluation
  const formValues = useWatch({ control }) as Record<string, unknown>;

  // Memoize the evaluation to avoid unnecessary recalculations
  const result = useMemo(() => {
    const hiddenFields = new Set<string>();
    const conditionallyRequiredFields = new Set<string>();
    const readOnlyFields = new Set<string>();

    // Evaluate each field's conditions
    Object.entries(properties).forEach(([fieldName, fieldDef]) => {
      const ui = fieldDef.ui;
      
      if (!ui) {
        return;
      }

      // Check if field should be hidden
      if (ui.hiddenWhen && isFieldHidden(ui.hiddenWhen, formValues)) {
        hiddenFields.add(fieldName);
      }

      // Check if field should be required (don't add if hidden)
      if (ui.requiredWhen && !hiddenFields.has(fieldName)) {
        if (isFieldRequired(ui.requiredWhen, formValues)) {
          conditionallyRequiredFields.add(fieldName);
        }
      }

      // Check if field should be read-only
      if (ui.readOnlyWhen && isFieldReadOnly(ui.readOnlyWhen, formValues)) {
        readOnlyFields.add(fieldName);
      }
    });

    return {
      hiddenFields,
      conditionallyRequiredFields,
      readOnlyFields,
    };
  }, [properties, formValues]);

  return result;
}

/**
 * Get all fields that depend on a specific field
 * 
 * @param properties - Form field definitions
 * @param fieldName - Field to find dependents for
 * @returns Array of field names that depend on the given field
 */
export function getFieldDependents(
  properties: Record<string, FieldDefinition>,
  fieldName: string
): string[] {
  const dependents: string[] = [];

  Object.entries(properties).forEach(([name, field]) => {
    if (field.ui?.dependsOn?.includes(fieldName)) {
      dependents.push(name);
    }
    
    // Also check conditional rules for dependencies
    const rules = [
      field.ui?.hiddenWhen,
      field.ui?.requiredWhen,
      field.ui?.readOnlyWhen,
    ];
    
    rules.forEach(rule => {
      if (ruleReferencesField(rule, fieldName)) {
        if (!dependents.includes(name)) {
          dependents.push(name);
        }
      }
    });
  });

  return dependents;
}

/**
 * Check if a conditional rule references a specific field
 * 
 * @param rule - Conditional rule to check
 * @param fieldName - Field name to look for
 * @returns true if rule references the field
 */
function ruleReferencesField(
  rule: ConditionalRule | undefined,
  fieldName: string
): boolean {
  if (!rule) {
    return false;
  }

  // Check direct field reference
  if (rule.field === fieldName) {
    return true;
  }

  // Check nested dot notation (e.g., "parent.child" matches "parent")
  if (rule.field?.startsWith(`${fieldName}.`)) {
    return true;
  }

  // Check AND sub-rules
  if (rule.and) {
    return rule.and.some(subRule => ruleReferencesField(subRule, fieldName));
  }

  // Check OR sub-rules
  if (rule.or) {
    return rule.or.some(subRule => ruleReferencesField(subRule, fieldName));
  }

  return false;
}

/**
 * Compute final required fields list by merging base and conditional requirements
 * 
 * @param baseRequired - Base required fields from schema
 * @param conditionallyRequired - Fields required by conditions
 * @param hiddenFields - Fields that are hidden
 * @returns Combined set of required field names (excluding hidden)
 */
export function computeRequiredFields(
  baseRequired: string[],
  conditionallyRequired: Set<string>,
  hiddenFields: Set<string>
): string[] {
  const allRequired = new Set([...baseRequired, ...conditionallyRequired]);
  
  // Remove hidden fields from required list
  hiddenFields.forEach(field => allRequired.delete(field));
  
  return Array.from(allRequired);
}
