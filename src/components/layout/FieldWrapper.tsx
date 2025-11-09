/**
 * FieldWrapper component
 * 
 * Common wrapper for all field components providing consistent layout,
 * label, help text, and error message display.
 * Migrated to use shadcn/ui components.
 */

'use client';

import React from 'react';
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FieldWrapperProps {
  /** Field unique identifier */
  id: string;

  /** Field label */
  label: string;

  /** Whether field is required */
  required?: boolean;

  /** Help text displayed below label */
  description?: string;

  /** Error message */
  error?: string;

  /** Grid column span (1-12) */
  width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

  /** Column offset - number of columns to skip before field (1-11) */
  offset?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

  /** Child input element */
  children: React.ReactNode;
}

export default function FieldWrapper({
  id,
  label,
  required,
  description,
  error,
  width = 12,
  offset,
  children,
}: FieldWrapperProps) {
  // Map width to responsive Tailwind classes using container queries
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

  // Map offset to responsive Tailwind grid column start classes
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

  const widthClass = widthClasses[width];
  const offsetClass = offset ? offsetClasses[offset] : '';
  const combinedClasses = `${widthClass} ${offsetClass}`.trim();

  return (
    <div 
      className={cn(combinedClasses, "grid grid-rows-[auto_auto_1fr_auto] gap-y-0")}
      data-field-path={id}
    >
      <Label
        htmlFor={id}
        className="text-sm font-semibold mb-1.5"
      >
        {label}
        {required && (
          <span className="text-destructive ml-1 font-normal" aria-label="required">
            *
          </span>
        )}
      </Label>

      <div className="min-h-[20px] mb-2">
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div>
        {children}
      </div>

      {error && (
        <p
          className="mt-1.5 text-sm text-destructive flex items-start"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
