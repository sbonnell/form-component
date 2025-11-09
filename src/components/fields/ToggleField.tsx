/**
 * ToggleField component
 * 
 * Toggle switch for boolean values (alternative to checkbox)
 * Migrated to use shadcn/ui Switch component.
 */

'use client';

import React from 'react';
import { useFormContext, useController } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import { Switch } from '@/components/ui/switch';
import type { FieldDefinition } from '@/types/schema';

export interface ToggleFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function ToggleField({ name, field, required, disabled }: ToggleFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  
  const error = errors[name]?.message as string | undefined;
  const isChecked = Boolean(controllerField.value);

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
      <Switch
        id={name}
        checked={isChecked}
        onCheckedChange={controllerField.onChange}
        onBlur={controllerField.onBlur}
        disabled={disabled || field.readOnly}
        aria-labelledby={`${name}-label`}
        aria-describedby={error ? `${name}-error` : field.description ? `${name}-description` : undefined}
      />
      
      {/* Toggle label (optional inline label) */}
      {field.ui?.help && (
        <p className="mt-2 text-xs text-muted-foreground">
          {field.ui.help}
        </p>
      )}
    </FieldWrapper>
  );
}
