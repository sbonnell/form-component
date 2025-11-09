/**
 * TimeField component
 * 
 * Input field for time values (HH:MM or HH:MM:SS)
 * Migrated to use shadcn/ui Input component.
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import { Input } from '@/components/ui/input';
import type { FieldDefinition } from '@/types/schema';
import { cn } from '@/lib/utils';
import { Clock } from 'lucide-react';

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
        <Input
          {...register(name)}
          id={name}
          type="time"
          step={withSeconds ? 1 : 60}
          placeholder={placeholder}
          disabled={disabled || field.readOnly}
          className={cn(
            'pr-10',
            error && 'border-destructive focus-visible:ring-destructive'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        
        {/* Time icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Clock className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      {/* Help text */}
      {!error && field.ui?.help && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {field.ui.help}
        </p>
      )}
    </FieldWrapper>
  );
}
