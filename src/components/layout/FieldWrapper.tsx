/**
 * FieldWrapper component
 * 
 * Common wrapper for all field components providing consistent layout,
 * label, help text, and error message display.
 */

'use client';

import React from 'react';

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
    1: '@md:col-start-2 @lg:col-start-2',
    2: '@md:col-start-3 @lg:col-start-3',
    3: '@md:col-start-4 @lg:col-start-4',
    4: '@md:col-start-5 @lg:col-start-5',
    5: '@md:col-start-6 @lg:col-start-6',
    6: '@md:col-start-7 @lg:col-start-7',
    7: '@md:col-start-8 @lg:col-start-8',
    8: '@md:col-start-9 @lg:col-start-9',
    9: '@md:col-start-10 @lg:col-start-10',
    10: '@md:col-start-11 @lg:col-start-11',
    11: '@md:col-start-12 @lg:col-start-12',
  };

  const widthClass = widthClasses[width];
  const offsetClass = offset ? offsetClasses[offset] : '';
  const combinedClasses = `${widthClass} ${offsetClass}`.trim();

  return (
    <div className={`${combinedClasses} grid grid-rows-[auto_auto_1fr_auto] gap-y-0`}>
      <label
        htmlFor={id}
        className="text-sm font-semibold text-gray-700 mb-1.5"
      >
        {label}
        {required && (
          <span className="text-red-500 ml-1 font-normal" aria-label="required">
            *
          </span>
        )}
      </label>

      {/* Description area - always present even if empty to maintain alignment */}
      <div className="min-h-[20px] mb-2">
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Input field area */}
      <div>
        {children}
      </div>

      {/* Error message area */}
      {error && (
        <p
          className="mt-1.5 text-sm text-red-600 flex items-start"
          role="alert"
        >
          <svg
            className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
