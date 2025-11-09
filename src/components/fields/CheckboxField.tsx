/**
 * CheckboxField component
 * 
 * Boolean checkbox field.
 * Migrated to use shadcn/ui Checkbox component.
 */

'use client';

import React from 'react';
import { useFormContext, useController } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FieldDefinition } from '@/types/schema';

export interface CheckboxFieldProps {
  /** Field path (dot-notation) */
  name: string;
  
  /** Field definition from schema */
  field: FieldDefinition;
  
  /** Whether field is required */
  required?: boolean;
  
  /** Whether field is disabled */
  disabled?: boolean;
}

export default function CheckboxField({ name, field, required, disabled }: CheckboxFieldProps) {
  const { control, formState: { errors } } = useFormContext();
  const { field: controllerField } = useController({ name, control });
  
  const error = errors[name]?.message as string | undefined;
  
  const widthClasses = {
    1: 'col-span-1',
    2: 'col-span-1 @md:col-span-2',
    3: 'col-span-1 @md:col-span-3',
    4: 'col-span-1 @md:col-span-4 @lg:col-span-4',
    5: 'col-span-1 @md:col-span-5',
    6: 'col-span-1 @md:col-span-3 @lg:col-span-3 @xl:col-span-6',
    7: 'col-span-1 @md:col-span-4 @lg:col-span-4 @xl:col-span-7',
    8: 'col-span-1 @md:col-span-4 @lg:col-span-4 @xl:col-span-8',
    9: 'col-span-1 @md:col-span-5 @lg:col-span-5 @xl:col-span-9',
    10: 'col-span-1 @md:col-span-5 @lg:col-span-5 @xl:col-span-10',
    11: 'col-span-1 @md:col-span-6 @lg:col-span-6 @xl:col-span-11',
    12: 'col-span-1 @md:col-span-6 @lg:col-span-6 @xl:col-span-12',
  };
  
  const offsetClasses = {
    1: '@md:col-start-2 @lg:col-start-2 @xl:col-start-2',
    2: '@md:col-start-3 @lg:col-start-3 @xl:col-start-3',
    3: '@md:col-start-4 @lg:col-start-4 @xl:col-start-4',
    4: '@md:col-start-5 @lg:col-start-5 @xl:col-start-5',
    5: '@md:col-start-6 @lg:col-start-6 @xl:col-start-6',
    6: '@md:col-start-7 @lg:col-start-7 @xl:col-start-7',
    7: '@xl:col-start-8',
    8: '@xl:col-start-9',
    9: '@xl:col-start-10',
    10: '@xl:col-start-11',
    11: '@xl:col-start-12',
  };

  const width = field.ui?.width || 12;
  const offset = field.ui?.offset;
  const widthClass = widthClasses[width as keyof typeof widthClasses] || widthClasses[12];
  const offsetClass = offset ? offsetClasses[offset as keyof typeof offsetClasses] : '';
  const combinedClasses = `${widthClass} ${offsetClass}`.trim();

  return (
    <div className={cn(combinedClasses, "grid grid-rows-[auto_auto_1fr_auto] gap-y-0")}>
      {/* Empty label space to align with other fields */}
      <div className="text-sm font-semibold mb-1.5 h-[1.25rem]" />

      {/* Empty description space to align with other fields */}
      <div className="min-h-[20px] mb-2" />

      {/* Checkbox content aligned with input field position */}
      <div className={`flex items-center space-x-3 p-3 rounded-lg border ${error ? 'border-destructive bg-destructive/5' : 'border-border bg-muted/50'} transition-all duration-150 h-10`}>
        <div className="flex items-center h-4">
          <Checkbox
            id={name}
            checked={controllerField.value}
            onCheckedChange={controllerField.onChange}
            onBlur={controllerField.onBlur}
            disabled={disabled || field.readOnly}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
          />
        </div>
        <div className="flex-1 min-w-0 flex items-center">
          <Label htmlFor={name} className="text-sm font-semibold cursor-pointer">
            {field.title}
            {required && (
              <span className="text-destructive ml-1 font-normal" aria-label="required">
                *
              </span>
            )}
          </Label>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-1.5 text-sm text-destructive flex items-start" role="alert" id={`${name}-error`}>
          <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
