/**
 * MaskedField component
 * 
 * Input field with format masking (IBAN, UK postcode, sort code, phone)
 * Migrated to use shadcn/ui Input component.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useFormContext, useController } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import { Input } from '@/components/ui/input';
import { Check } from 'lucide-react';
import type { FieldDefinition } from '@/types/schema';
import { cn } from '@/lib/utils';
import { MASKS, applyMask, unmask, isCompleteMask, type MaskType } from '@/lib/formatting/masks';
import {
  validateIBAN,
  validateUKPostcode,
  validateUKSortCode,
  validateE164Phone,
} from '@/lib/formatting/validators';

export interface MaskedFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
  
  /** Mask type */
  maskType: MaskType;
}

export default function MaskedField({ name, field, required, disabled, maskType }: MaskedFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  
  const [displayValue, setDisplayValue] = useState('');
  
  const error = errors[name]?.message as string | undefined;
  const placeholder = field.ui?.placeholder || '';
  
  // Get mask configuration
  const mask = MASKS[maskType];
  
  // Sync display value with form value
  useEffect(() => {
    const rawValue = controllerField.value || '';
    if (rawValue) {
      setDisplayValue(applyMask(rawValue, mask));
    } else {
      setDisplayValue('');
    }
  }, [controllerField.value, mask]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Apply mask
    const masked = applyMask(inputValue, mask);
    setDisplayValue(masked);
    
    // Store unmasked value in form
    const unmasked = unmask(masked, mask);
    controllerField.onChange(unmasked);
  };
  
  const handleBlur = () => {
    controllerField.onBlur();
    
    // Validate format on blur
    const rawValue = controllerField.value || '';
    if (rawValue) {
      switch (maskType) {
        case 'iban':
          validateIBAN(rawValue);
          break;
        case 'ukPostcode':
          validateUKPostcode(rawValue);
          break;
        case 'ukSortCode':
          validateUKSortCode(rawValue);
          break;
        case 'phoneE164':
          validateE164Phone(rawValue);
          break;
      }
      
      // Note: Validation errors will be shown by Zod validator
      // This is just for real-time feedback
    }
  };
  
  // Check if mask is complete
  const isComplete = displayValue ? isCompleteMask(displayValue, mask) : false;
  
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
        <Input
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          id={name}
          type="text"
          placeholder={placeholder}
          disabled={disabled || field.readOnly}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            isComplete && !error && 'pr-10'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        
        {/* Completion indicator */}
        {isComplete && !error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Check className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>
      
      {/* Format hint */}
      {!error && field.ui?.help && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {field.ui.help}
        </p>
      )}
    </FieldWrapper>
  );
}
