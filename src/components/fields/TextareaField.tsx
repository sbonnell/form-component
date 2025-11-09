/**
 * TextareaField component
 * 
 * Multi-line text input field.
 * Migrated to use shadcn/ui Textarea component.
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import { Textarea } from '@/components/ui/textarea';
import type { FieldDefinition } from '@/types/schema';
import { cn } from '@/lib/utils';

export interface TextareaFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function TextareaField({ name, field, required, disabled }: TextareaFieldProps) {
  const { register, formState: { errors } } = useFormContext();
  
  const error = errors[name]?.message as string | undefined;
  const placeholder = field.ui?.placeholder || '';

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
      <Textarea
        {...register(name)}
        id={name}
        placeholder={placeholder}
        disabled={disabled || field.readOnly}
        rows={4}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    </FieldWrapper>
  );
}
