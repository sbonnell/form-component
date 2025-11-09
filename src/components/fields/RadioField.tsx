/**
 * RadioField component
 * 
 * Radio button group for single selection
 * Migrated to use shadcn/ui RadioGroup component.
 */

'use client';

import React from 'react';
import { useFormContext, useController } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import type { FieldDefinition } from '@/types/schema';
import type { Option } from '@/lib/options/types';
import { cn } from '@/lib/utils';

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
  const { control, formState: { errors } } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  
  const error = errors[name]?.message as string | undefined;
  
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
      <RadioGroup
        value={String(controllerField.value || '')}
        onValueChange={controllerField.onChange}
        onBlur={controllerField.onBlur}
        disabled={disabled || field.readOnly}
        className={cn(layout === 'horizontal' && 'flex flex-wrap gap-4')}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      >
        {options.map((option) => {
          const optionId = `${name}-${String(option.value)}`;
          const valueStr = String(option.value);
          
          return (
            <div key={valueStr} className="flex items-center space-x-2">
              <RadioGroupItem
                value={valueStr}
                id={optionId}
                disabled={disabled || field.readOnly}
              />
              <Label
                htmlFor={optionId}
                className={cn(
                  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer',
                  (disabled || field.readOnly) && 'cursor-not-allowed opacity-70'
                )}
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
      
      {/* Help text */}
      {!error && field.ui?.help && (
        <p className="mt-2 text-xs text-muted-foreground">
          {field.ui.help}
        </p>
      )}
    </FieldWrapper>
  );
}
