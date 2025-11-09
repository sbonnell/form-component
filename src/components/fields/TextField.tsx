/**
 * TextField component
 * 
 * Basic text input field with validation support.
 * Migrated to use shadcn/ui Input component.
 */

'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import { Input } from '@/components/ui/input';
import type { FieldDefinition } from '@/types/schema';
import { cn } from '@/lib/utils';

export interface TextFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function TextField({ name, field, required, disabled }: TextFieldProps) {
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
      <Input
        {...register(name)}
        id={name}
        type="text"
        placeholder={placeholder}
        disabled={disabled || field.readOnly}
        className={cn(error && 'border-destructive focus-visible:ring-destructive')}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    </FieldWrapper>
  );
}
