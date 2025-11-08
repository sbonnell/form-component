/**
 * useValidation hook
 * 
 * Handles dynamic validation based on conditional rules.
 * Adjusts required fields based on hiddenWhen/requiredWhen conditions.
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
  
  // For now (US1-US3), just use static required fields from schema
  // Dynamic conditional validation will be implemented in US4
  const requiredFields = useMemo(() => {
    return new Set(schema.required || []);
  }, [schema.required]);
  
  return {
    requiredFields,
  };
}
