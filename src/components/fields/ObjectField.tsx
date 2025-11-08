/**
 * ObjectField component
 * 
 * Nested object field group with collapsible UI
 */

'use client';

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import TextField from './TextField';
import NumberField from './NumberField';
import CheckboxField from './CheckboxField';
import SelectField from './SelectField';
import type { FieldDefinition } from '@/types/schema';

export interface ObjectFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
  
  /** Hidden fields set */
  hiddenFields?: Set<string>;
  
  /** Conditionally required fields set */
  conditionallyRequiredFields?: Set<string>;
  
  /** Read-only fields set */
  readOnlyFields?: Set<string>;
}

export default function ObjectField({ 
  name, 
  field, 
  required, 
  disabled,
  hiddenFields = new Set(),
  conditionallyRequiredFields = new Set(),
  readOnlyFields = new Set()
}: ObjectFieldProps) {
  const { formState: { errors } } = useFormContext();
  const [isExpanded, setIsExpanded] = useState(true);
  
  const error = errors[name]?.message as string | undefined;
  
  // Get nested properties
  const properties = field.properties || {};
  const requiredFields = field.required || [];
  
  if (Object.keys(properties).length === 0) {
    console.error(`ObjectField: No properties defined for field "${name}"`);
    return null;
  }
  
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
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
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Collapsible header */}
        <button
          type="button"
          onClick={toggleExpanded}
          className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-150"
        >
          <span className="text-sm font-medium text-gray-700">
            {isExpanded ? 'Hide' : 'Show'} nested fields
          </span>
          
          <svg
            className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Nested fields */}
        {isExpanded && (
          <div className="p-4 space-y-4 bg-white">
            {Object.entries(properties).map(([key, nestedField]) => {
              const fieldPath = `${name}.${key}`;
              
              // Skip hidden nested fields
              if (hiddenFields.has(fieldPath)) {
                return null;
              }
              
              const isFieldRequired = requiredFields.includes(key) || conditionallyRequiredFields.has(fieldPath);
              const isFieldDisabled = disabled || readOnlyFields.has(fieldPath) || field.readOnly;
              
              return (
                <div key={key}>
                  {nestedField.type === 'string' && !nestedField.enum && (
                    <TextField
                      name={fieldPath}
                      field={nestedField}
                      required={isFieldRequired}
                      disabled={isFieldDisabled}
                    />
                  )}
                  
                  {nestedField.type === 'string' && nestedField.enum && (
                    <SelectField
                      name={fieldPath}
                      field={nestedField}
                      required={isFieldRequired}
                      disabled={isFieldDisabled}
                    />
                  )}
                  
                  {nestedField.type === 'number' && (
                    <NumberField
                      name={fieldPath}
                      field={nestedField}
                      required={isFieldRequired}
                      disabled={isFieldDisabled}
                    />
                  )}
                  
                  {nestedField.type === 'boolean' && (
                    <CheckboxField
                      name={fieldPath}
                      field={nestedField}
                      required={isFieldRequired}
                      disabled={isFieldDisabled}
                    />
                  )}
                  
                  {nestedField.type === 'object' && (
                    <ObjectField
                      name={fieldPath}
                      field={nestedField}
                      required={isFieldRequired}
                      disabled={isFieldDisabled}
                      hiddenFields={hiddenFields}
                      conditionallyRequiredFields={conditionallyRequiredFields}
                      readOnlyFields={readOnlyFields}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
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
