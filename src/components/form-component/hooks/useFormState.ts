/**
 * useFormState hook
 * 
 * Integrates React Hook Form with form schema and validation.
 * Manages form state, validation, and submission.
 */

import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import type { FormSchema } from '@/types/schema';
import { schemaToZod } from '@/lib/schema/validator';
import { getDefaultValues } from '@/lib/schema/parser';

export interface UseFormStateOptions {
  /** Form schema */
  schema: FormSchema;
  
  /** Initial form data (for edit mode) */
  initialData?: Record<string, any>;
  
  /** Dynamic required fields (from conditional logic) */
  requiredFields?: Set<string>;
}

export function useFormState(options: UseFormStateOptions): UseFormReturn {
  const { schema, initialData, requiredFields } = options;
  
  // Memoize default values to prevent recreation on every render
  const defaultValues = useMemo(() => getDefaultValues(schema), [schema]);
  
  // Memoize merged values
  const values = useMemo(() => {
    return initialData ? { ...defaultValues, ...initialData } : defaultValues;
  }, [defaultValues, initialData]);
  
  // Memoize Zod validation schema
  const validationSchema = useMemo(() => {
    return schemaToZod(
      schema.properties,
      requiredFields ? Array.from(requiredFields) : (schema.required || [])
    );
  }, [schema.properties, schema.required, requiredFields]);
  
  // Initialize React Hook Form
  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: values,
    mode: 'onBlur', // Validate on blur to reduce noise
  });
  
  return form;
}
