/**
 * DateField component
 * 
 * Date picker input field with calendar popup.
 * Migrated to use shadcn/ui Calendar and Popover components.
 */

'use client';

import React from 'react';
import { useFormContext, useController } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { FieldDefinition } from '@/types/schema';
import { cn } from '@/lib/utils';

export interface DateFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function DateField({ name, field, required, disabled }: DateFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  
  const error = errors[name]?.message as string | undefined;

  const { field: controllerField } = useController({
    name,
    control,
    rules: {
      required: required ? `${field.title} is required` : false,
    },
  });

  const dateValue = controllerField.value ? new Date(controllerField.value) : undefined;

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
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !controllerField.value && 'text-muted-foreground',
              error && 'border-destructive'
            )}
            disabled={disabled || field.readOnly}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {controllerField.value ? (
              format(new Date(controllerField.value), 'PPP')
            ) : (
              <span>{field.ui?.placeholder || 'Pick a date'}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={dateValue}
            onSelect={(date) => {
              controllerField.onChange(date ? format(date, 'yyyy-MM-dd') : '');
            }}
            disabled={disabled || field.readOnly}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </FieldWrapper>
  );
}
