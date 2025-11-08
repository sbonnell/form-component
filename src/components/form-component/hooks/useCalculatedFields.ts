/**
 * useCalculatedFields Hook
 * 
 * Manages calculated fields that compute values based on formulas.
 * Automatically recomputes when dependencies change.
 */

import { useEffect, useMemo } from 'react';
import { useWatch, type Control, type UseFormSetValue } from 'react-hook-form';
import type { CalculatedField } from '@/types/schema';
import { evaluateFormula } from '@/lib/calculations/evaluator';
import { getEvaluationOrder } from '@/lib/calculations/dependency-tracker';

interface UseCalculatedFieldsParams {
  /** Calculated field definitions from schema.logic.calculated */
  calculatedFields?: CalculatedField[];
  
  /** React Hook Form control */
  control: Control<any>;
  
  /** React Hook Form setValue function */
  setValue: UseFormSetValue<any>;
}

/**
 * Hook to manage calculated fields
 * 
 * Watches form values and updates calculated fields when dependencies change.
 * Evaluates fields in topological order to handle nested calculations.
 */
export function useCalculatedFields({
  calculatedFields = [],
  control,
  setValue,
}: UseCalculatedFieldsParams) {
  // Get evaluation order (with dependencies evaluated first)
  const orderedFields = useMemo(() => {
    if (calculatedFields.length === 0) {
      return [];
    }
    
    try {
      return getEvaluationOrder(calculatedFields);
    } catch (error) {
      console.error('Error determining calculation order:', error);
      return calculatedFields; // Fall back to original order
    }
  }, [calculatedFields]);
  
  // Collect all unique dependency fields
  const dependencyFields = useMemo(() => {
    const deps = new Set<string>();
    for (const calc of orderedFields) {
      calc.dependsOn.forEach(dep => deps.add(dep));
    }
    return Array.from(deps);
  }, [orderedFields]);
  
  // Watch only the dependency fields (not all form values)
  const watchedValues = useWatch({
    control,
    name: dependencyFields as any, // Cast needed for dynamic field array
  });
  
  // Serialize watched values for stable dependency comparison
  const serializedDeps = useMemo(() => {
    if (!watchedValues || dependencyFields.length === 0) {
      return '';
    }
    
    // Build a map of field -> value
    const valueMap: Record<string, unknown> = {};
    if (Array.isArray(watchedValues)) {
      dependencyFields.forEach((field, index) => {
        valueMap[field] = watchedValues[index];
      });
    } else {
      valueMap[dependencyFields[0]] = watchedValues;
    }
    
    return JSON.stringify(valueMap);
  }, [watchedValues, dependencyFields]);
  
  // Evaluate all calculated fields when dependencies change
  useEffect(() => {
    if (orderedFields.length === 0 || dependencyFields.length === 0) {
      return;
    }
    
    // Get all form values for evaluation
    const allValues = control._formValues as Record<string, unknown>;
    
    // Track which fields we've updated in this pass
    const updates = new Map<string, unknown>();
    
    for (const calc of orderedFields) {
      try {
        // Build context with both form values and already-computed values
        const context = { ...allValues, ...Object.fromEntries(updates) };
        
        const result = evaluateFormula(calc.formula, context, calc.dependsOn);
        
        if (result !== undefined) {
          // Only update if value changed
          const currentValue = allValues[calc.target];
          if (currentValue !== result) {
            setValue(calc.target, result, {
              shouldDirty: false, // Don't mark as dirty (it's auto-calculated)
              shouldTouch: false,
              shouldValidate: false, // Don't validate to avoid triggering re-render
            });
            updates.set(calc.target, result);
          }
        }
      } catch (error) {
        console.warn(`Failed to evaluate calculated field "${calc.target}":`, error);
      }
    }
  }, [serializedDeps, orderedFields, setValue, control, dependencyFields.length]);
  
  return {
    calculatedFields: orderedFields,
  };
}
