/**
 * ToggleField component
 * 
 * Toggle switch for boolean values (alternative to checkbox)
 */

'use client';

import React from 'react';
import { useFormContext, useController } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import type { FieldDefinition } from '@/types/schema';

export interface ToggleFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function ToggleField({ name, field, required, disabled }: ToggleFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  
  const error = errors[name]?.message as string | undefined;
  const isChecked = Boolean(controllerField.value);

  const handleToggle = () => {
    if (disabled || field.readOnly) return;
    controllerField.onChange(!isChecked);
  };

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
      <button
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-labelledby={`${name}-label`}
        aria-describedby={error ? `${name}-error` : field.description ? `${name}-description` : undefined}
        onClick={handleToggle}
        onBlur={controllerField.onBlur}
        disabled={disabled || field.readOnly}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isChecked 
            ? 'bg-blue-600' 
            : error 
            ? 'bg-red-300' 
            : 'bg-gray-200'
          }
          ${(disabled || field.readOnly)
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer hover:bg-opacity-90'
          }`}
      >
        <span className="sr-only">{field.title}</span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-200 ease-in-out
            ${isChecked ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
      
      {/* Toggle label (optional inline label) */}
      {field.ui?.help && (
        <p className="mt-2 text-xs text-gray-500">
          {field.ui.help}
        </p>
      )}
    </FieldWrapper>
  );
}
