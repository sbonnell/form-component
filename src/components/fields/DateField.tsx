/**
 * DateField component
 * 
 * Date picker input field.
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import type { FieldDefinition } from '@/types/schema';

export interface DateFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function DateField({ name, field, required, disabled }: DateFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  
  const error = errors[name]?.message as string | undefined;

  return (
    <FieldWrapper
      id={name}
      label={field.title}
      required={required}
      description={field.description}
      error={error}
      width={field.ui?.width}
      offset={field.ui?.offset}
    >
      <input
        {...register(name)}
        id={name}
        type="date"
        disabled={disabled || field.readOnly}
        className={`w-full px-4 py-2.5 text-sm border rounded-lg shadow-sm transition-all duration-150 
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    </FieldWrapper>
  );
}
