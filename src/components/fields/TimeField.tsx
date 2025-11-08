/**
 * TimeField component
 * 
 * Input field for time values (HH:MM or HH:MM:SS)
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import type { FieldDefinition } from '@/types/schema';

export interface TimeFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
  
  /** Include seconds (HH:MM:SS) or not (HH:MM) */
  withSeconds?: boolean;
}

export default function TimeField({ name, field, required, disabled, withSeconds = false }: TimeFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  
  const error = errors[name]?.message as string | undefined;
  const placeholder = field.ui?.placeholder || (withSeconds ? 'HH:MM:SS' : 'HH:MM');

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
      <div className="relative">
        <input
          {...register(name)}
          id={name}
          type="time"
          step={withSeconds ? 1 : 60}
          placeholder={placeholder}
          disabled={disabled || field.readOnly}
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
        
        {/* Time icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      </div>
      
      {/* Help text */}
      {!error && field.ui?.help && (
        <p className="mt-1.5 text-xs text-gray-500">
          {field.ui.help}
        </p>
      )}
    </FieldWrapper>
  );
}
