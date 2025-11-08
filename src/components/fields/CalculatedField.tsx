/**
 * CalculatedField Component
 * 
 * Read-only field that displays a value computed from a formula.
 * The value is automatically updated by useCalculatedFields hook.
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import type { FieldDefinition } from '@/types/schema';

export interface CalculatedFieldProps {
  /** Field name */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required (not applicable for calculated fields) */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
  
  /** Number of decimal places to display (for numeric values) */
  decimalPlaces?: number;
  
  /** Prefix to display before value (e.g., "$" for currency) */
  prefix?: string;
  
  /** Suffix to display after value (e.g., "%" for percentage) */
  suffix?: string;
}

export function CalculatedField({
  name,
  field,
  required = false,
  disabled = false,
  decimalPlaces,
  prefix,
  suffix,
}: CalculatedFieldProps) {
  const { watch } = useFormContext();
  const value = watch(name);
  
  // Format the display value
  const displayValue = React.useMemo(() => {
    // Handle empty, null, undefined, or NaN
    if (value === undefined || value === null || value === '' || 
        (typeof value === 'number' && isNaN(value))) {
      return '—'; // Em dash for empty/undefined/NaN
    }
    
    // Format numbers with decimal places
    if (typeof value === 'number') {
      const formatted = decimalPlaces !== undefined
        ? value.toFixed(decimalPlaces)
        : String(value);
      
      return `${prefix || ''}${formatted}${suffix || ''}`;
    }
    
    // Format booleans
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    // Default to string representation
    return `${prefix || ''}${String(value)}${suffix || ''}`;
  }, [value, decimalPlaces, prefix, suffix]);
  
  return (
    <FieldWrapper
      id={name}
      label={field.title}
      required={required}
      description={field.description}
      width={field.ui?.width}
      offset={field.ui?.offset}
    >
      <div className="mt-2 block w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-medium">
        {displayValue}
      </div>
      
      {/* Hidden input to maintain form state */}
      <input
        type="hidden"
        name={name}
        value={value !== undefined && value !== null ? String(value) : ''}
      />
    </FieldWrapper>
  );
}
