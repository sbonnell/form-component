/**
 * DateTimeField component
 * 
 * Input field for date and time values (datetime-local)
 * Migrated to use shadcn/ui Input component.
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';
import type { FieldDefinition } from '@/types/schema';
import { cn } from '@/lib/utils';

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
        <Input
          {...register(name)}
          id={name}
          type="datetime-local"
          placeholder={placeholder}
          disabled={disabled || field.readOnly}
          className={cn(
            error && 'border-destructive focus-visible:ring-destructive',
            'pr-10'
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
      
      {!error && field.ui?.help && (
        <p className="mt-1.5 text-xs text-muted-foreground">
          {field.ui.help}
        </p>
      )}
    </FieldWrapper>
  );
}
