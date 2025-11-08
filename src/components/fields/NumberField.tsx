/**
 * NumberField component
 * 
 * Numeric input field with min/max validation.
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import type { FieldDefinition } from '@/types/schema';

export interface NumberFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function NumberField({ name, field, required, disabled }: NumberFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  
  const error = errors[name]?.message as string | undefined;
  const placeholder = field.ui?.placeholder || '';

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
        {...register(name, {
          valueAsNumber: true,
        })}
        id={name}
        type="number"
        placeholder={placeholder}
        disabled={disabled || field.readOnly}
        min={field.minimum}
        max={field.maximum}
        step={field.type === 'integer' ? 1 : 'any'}
        className={`w-full px-4 py-2.5 text-sm border rounded-lg shadow-sm transition-all duration-150 
          ${error 
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }
          focus:outline-none focus:ring-2 focus:ring-offset-0
          disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
          placeholder:text-gray-400`}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    </FieldWrapper>
  );
}
