/**
 * CheckboxField component
 * 
 * Boolean checkbox field.
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { FieldDefinition } from '@/types/schema';

export interface CheckboxFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function CheckboxField({ name, field, required, disabled }: CheckboxFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  
  const error = errors[name]?.message as string | undefined;
  const widthClasses = {
    1: 'col-span-1',
    2: 'col-span-1 sm:col-span-2',
    3: 'col-span-1 sm:col-span-3',
    4: 'col-span-1 sm:col-span-4 lg:col-span-4',
    5: 'col-span-1 sm:col-span-5',
    6: 'col-span-1 sm:col-span-2 lg:col-span-6',
    7: 'col-span-1 sm:col-span-2 lg:col-span-7',
    8: 'col-span-1 sm:col-span-2 lg:col-span-8',
    9: 'col-span-1 sm:col-span-2 lg:col-span-9',
    10: 'col-span-1 sm:col-span-2 lg:col-span-10',
    11: 'col-span-1 sm:col-span-2 lg:col-span-11',
    12: 'col-span-1 sm:col-span-2 lg:col-span-12',
  };
  
  const offsetClasses = {
    1: 'sm:col-start-2',
    2: 'sm:col-start-3',
    3: 'sm:col-start-4',
    4: 'sm:col-start-5',
    5: 'sm:col-start-6',
    6: 'sm:col-start-7',
    7: 'sm:col-start-8',
    8: 'sm:col-start-9',
    9: 'sm:col-start-10',
    10: 'sm:col-start-11',
    11: 'sm:col-start-12',
  };

  const width = field.ui?.width || 12;
  const offset = field.ui?.offset;
  const widthClass = widthClasses[width as keyof typeof widthClasses] || widthClasses[12];
  const offsetClass = offset ? offsetClasses[offset as keyof typeof offsetClasses] : '';
  const combinedClasses = `${widthClass} ${offsetClass}`.trim();

  return (
    <div className={`${combinedClasses} flex items-start space-x-3 p-4 rounded-lg border ${error ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'} transition-all duration-150`}>
      <div className="flex items-center h-6 mt-0.5">
        <input
          {...register(name)}
          id={name}
          type="checkbox"
          disabled={disabled || field.readOnly}
          className="h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border-gray-300 rounded cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>
      <div className="flex-1 min-w-0">
        <label htmlFor={name} className="text-sm font-semibold text-gray-700 cursor-pointer">
          {field.title}
          {required && (
            <span className="text-red-500 ml-1 font-normal" aria-label="required">
              *
            </span>
          )}
        </label>
        {field.description && (
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">{field.description}</p>
        )}
        {error && (
          <p className="text-sm text-red-600 mt-1.5 flex items-start" role="alert" id={`${name}-error`}>
            <svg className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </p>
        )}
      </div>
    </div>
  );
}
