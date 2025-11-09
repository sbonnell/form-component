/**
 * DateTimeField component
 * 
 * Input field for date and time values with calendar picker and time input
 * Migrated to use shadcn/ui Calendar, Popover, and Input components.
 */

'use client';

import React from 'react';
import { useFormContext, useController } from 'react-hook-form';
import FieldWrapper from '@/components/layout/FieldWrapper';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
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
  const { control, formState: { errors } } = useFormContext();
  
  const error = errors[name]?.message as string | undefined;
  const placeholder = field.ui?.placeholder || 'Pick a date and time';

  const { field: controllerField } = useController({
    name,
    control,
    rules: {
      required: required ? `${field.title} is required` : false,
    },
  });

  // Parse the datetime-local value (YYYY-MM-DDTHH:mm)
  const dateValue = controllerField.value ? new Date(controllerField.value) : undefined;
  const timeValue = controllerField.value ? controllerField.value.split('T')[1] || '00:00' : '00:00';

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      controllerField.onChange('');
      return;
    }
    const newValue = `${format(date, 'yyyy-MM-dd')}T${timeValue}`;
    controllerField.onChange(newValue);
  };

  const handleTimeChange = (time: string) => {
    if (!dateValue) return;
    const newValue = `${format(dateValue, 'yyyy-MM-dd')}T${time}`;
    controllerField.onChange(newValue);
  };

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
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'flex-1 justify-start text-left font-normal',
                !controllerField.value && 'text-muted-foreground',
                error && 'border-destructive'
              )}
              disabled={disabled || field.readOnly}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {controllerField.value ? (
                format(new Date(controllerField.value), 'PPP')
              ) : (
                <span>{placeholder}</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleDateSelect}
              disabled={disabled || field.readOnly}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <div className="relative w-32">
          <Input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={disabled || field.readOnly || !dateValue}
            className={cn(
              'pl-10',
              error && 'border-destructive'
            )}
          />
          <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
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
