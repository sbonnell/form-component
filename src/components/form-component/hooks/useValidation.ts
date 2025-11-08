/**
 * useValidation hook
 * 
 * Handles dynamic validation based on conditional rules.
 * Returns base required fields from schema.
 * Conditional required fields are handled by useConditionalLogic hook.
 */

import { useMemo } from 'react';
import type { FormSchema } from '@/types/schema';
import type { UseFormReturn } from 'react-hook-form';

export interface UseValidationOptions {
  /** Form schema */
  schema: FormSchema;
  
  /** React Hook Form instance */
  form: UseFormReturn;
}

export function useValidation(options: UseValidationOptions) {
  const { schema } = options;
  
  // Base required fields from schema.required array
  // Conditional requirements (requiredWhen) are handled by useConditionalLogic
  const requiredFields = useMemo(() => {
    return new Set(schema.required || []);
  }, [schema.required]);
  
  return {
    requiredFields,
  };
}
