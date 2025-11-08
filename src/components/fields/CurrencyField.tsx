/**
 * CurrencyField component
 * 
 * Input field for currency values with formatting and validation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import type { FieldDefinition } from '@/types/schema';
import {
  formatCurrencyInput,
  parseCurrency,
  getCurrencySymbol,
  validateCurrency,
  type CurrencyFormatOptions,
} from '@/lib/formatting/currency';

export interface CurrencyFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function CurrencyField({ name, field, required, disabled }: CurrencyFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  
  const [displayValue, setDisplayValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  const error = errors[name]?.message as string | undefined;
  const placeholder = field.ui?.placeholder || '';
  
  // Currency options from schema
  const currency = field.ui?.currency || 'GBP';
  const decimals = field.ui?.decimalScale ?? 2;
  const showSymbol = true;
  
  const options: CurrencyFormatOptions = {
    currency,
    decimals,
    showSymbol,
    locale: 'en-GB',
  };
  
  // Sync display value with form value
  useEffect(() => {
    const numValue = controllerField.value;
    if (numValue !== null && numValue !== undefined && numValue !== '') {
      if (!isFocused) {
        // Show formatted currency when not focused
        setDisplayValue(formatCurrencyInput(numValue.toString(), options));
      }
    } else {
      setDisplayValue('');
    }
  }, [controllerField.value, isFocused, currency, decimals]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Apply currency formatting as user types
    const formatted = formatCurrencyInput(inputValue, options);
    setDisplayValue(formatted);
    
    // Parse to number and store in form
    const parsed = parseCurrency(formatted);
    controllerField.onChange(parsed);
  };
  
  const handleFocus = () => {
    setIsFocused(true);
    
    // Remove currency symbol on focus for easier editing
    const numValue = controllerField.value;
    if (numValue !== null && numValue !== undefined) {
      setDisplayValue(numValue.toString());
    }
  };
  
  const handleBlur = () => {
    setIsFocused(false);
    controllerField.onBlur();
    
    // Re-apply full formatting on blur
    const numValue = controllerField.value;
    if (numValue !== null && numValue !== undefined && numValue !== '') {
      setDisplayValue(formatCurrencyInput(numValue.toString(), options));
      
      // Validate currency constraints
      const validation = validateCurrency(numValue, {
        ...options,
        min: field.minimum,
        max: field.maximum,
      });
      
      // Note: Validation errors will be shown by Zod validator
    }
  };
  
  // Get currency symbol
  const symbol = getCurrencySymbol(currency);
  
  return (
    <FieldWrapper
      id={name}
      label={field.title}
      required={required}
      description={field.description}
      error={error}
      width={field.ui?.width}
    >
      <div className="relative">
        {/* Currency symbol prefix (when not focused) */}
        {!isFocused && displayValue && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500 text-sm font-medium">
              {symbol}
            </span>
          </div>
        )}
        
        <input
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          id={name}
          type="text"
          inputMode="decimal"
          placeholder={placeholder}
          disabled={disabled || field.readOnly}
          className={`w-full px-4 py-2.5 text-sm border rounded-lg shadow-sm transition-all duration-150 
            ${!isFocused && displayValue ? 'pl-8' : ''}
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
      </div>
      
      {/* Help text with min/max constraints */}
      {!error && (field.ui?.help || field.minimum !== undefined || field.maximum !== undefined) && (
        <div className="mt-1.5 space-y-0.5">
          {field.ui?.help && (
            <p className="text-xs text-gray-500">{field.ui.help}</p>
          )}
          {(field.minimum !== undefined || field.maximum !== undefined) && (
            <p className="text-xs text-gray-500">
              {field.minimum !== undefined && field.maximum !== undefined
                ? `Range: ${symbol}${field.minimum} - ${symbol}${field.maximum}`
                : field.minimum !== undefined
                ? `Minimum: ${symbol}${field.minimum}`
                : `Maximum: ${symbol}${field.maximum}`}
            </p>
          )}
        </div>
      )}
    </FieldWrapper>
  );
}
