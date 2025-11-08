/**
 * RadioField component
 * 
 * Radio button group for single selection
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import type { FieldDefinition } from '@/types/schema';
import type { Option } from '@/lib/options/types';

export interface RadioFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
  
  /** Radio button layout */
  layout?: 'vertical' | 'horizontal';
}

export default function RadioField({ 
  name, 
  field, 
  required, 
  disabled, 
  layout = 'vertical' 
}: RadioFieldProps) {
  const { register, formState: { errors }, watch } = useFormContext();
  
  const error = errors[name]?.message as string | undefined;
  const currentValue = watch(name);
  
  // Get options from field schema
  const options: Option[] = field.enum?.map((value) => {
    // Use value as label if no specific label provided
    const label = typeof value === 'string' ? value : String(value);
    return { value, label };
  }) || [];

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
      <div
        className={`space-${layout === 'horizontal' ? 'x' : 'y'}-3 ${
          layout === 'horizontal' ? 'flex flex-wrap' : ''
        }`}
        role="radiogroup"
        aria-labelledby={`${name}-label`}
        aria-required={required}
        aria-invalid={!!error}
      >
        {options.map((option) => {
          const optionId = `${name}-${String(option.value)}`;
          const isChecked = currentValue === option.value;
          const valueStr = String(option.value);
          
          return (
            <label
              key={valueStr}
              htmlFor={optionId}
              className={`relative flex items-start cursor-pointer group ${
                layout === 'horizontal' ? 'mr-6' : ''
              }`}
            >
              <div className="flex items-center h-5">
                <input
                  {...register(name)}
                  id={optionId}
                  type="radio"
                  value={valueStr}
                  disabled={disabled || field.readOnly}
                  className={`w-4 h-4 border-2 transition-all duration-150 cursor-pointer
                    ${error
                      ? 'border-red-300 text-red-600 focus:ring-red-500'
                      : 'border-gray-300 text-blue-600 focus:ring-blue-500'
                    }
                    focus:ring-2 focus:ring-offset-0
                    disabled:bg-gray-50 disabled:cursor-not-allowed
                    group-hover:border-blue-400`}
                />
              </div>
              
              <div className="ml-3">
                <span
                  className={`text-sm font-medium transition-colors duration-150
                    ${disabled || field.readOnly
                      ? 'text-gray-400'
                      : isChecked
                      ? 'text-gray-900'
                      : 'text-gray-700 group-hover:text-gray-900'
                    }`}
                >
                  {option.label}
                </span>
              </div>
            </label>
          );
        })}
      </div>
      
      {/* Help text */}
      {!error && field.ui?.help && (
        <p className="mt-2 text-xs text-gray-500">
          {field.ui.help}
        </p>
      )}
    </FieldWrapper>
  );
}
