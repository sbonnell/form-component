/**
 * DateTimeField component
 * 
 * Input field for date and time values (datetime-local)
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import type { FieldDefinition } from '@/types/schema';

export interface DateTimeFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function DateTimeField({ name, field, required, disabled }: DateTimeFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  
  const error = errors[name]?.message as string | undefined;
  const placeholder = field.ui?.placeholder || 'Select date and time';

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
          type="datetime-local"
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
        
        {/* Calendar icon */}
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
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
