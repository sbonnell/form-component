/**
 * GridLayout component
 * 
 * Renders fields in a responsive 12-column grid layout.
 * Maps field width specifications (1-12) to Tailwind grid classes.
 */

'use client';

import React from 'react';

export interface GridLayoutProps {
  /** Array of rows, each containing field elements with their widths */
  rows: Array<{
    fields: Array<{
      /** Field element to render */
      element: React.ReactNode;
      /** Column span (1-12) */
      width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
      /** Column offset - number of columns to skip before field (1-11) */
      offset?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
    }>;
  }>;

  /** Additional CSS classes */
  className?: string;
}

/**
 * Map width to responsive Tailwind grid column classes
 * Now using container queries instead of viewport media queries
 * Mobile: stack vertically (col-span-1)
 * @md (448px): use specified width
 * @lg (576px): intermediate breakpoint for smooth transitions
 * @xl (672px): maintain specified width
 */
function getColumnClass(width: number = 12): string {
  const widthClasses = {
    1: 'col-span-1',
    2: 'col-span-1 @md:col-span-2',
    3: 'col-span-1 @md:col-span-3',
    4: 'col-span-1 @md:col-span-4 @lg:col-span-4',
    5: 'col-span-1 @md:col-span-5',
    6: 'col-span-1 @md:col-span-3 @lg:col-span-3 @xl:col-span-6',
    7: 'col-span-1 @md:col-span-7',
    8: 'col-span-1 @md:col-span-4 @lg:col-span-4 @xl:col-span-8',
    9: 'col-span-1 @md:col-span-9',
    10: 'col-span-1 @md:col-span-5 @lg:col-span-5 @xl:col-span-10',
    11: 'col-span-1 @md:col-span-11',
    12: 'col-span-1 @md:col-span-12',
  };

  return widthClasses[width as keyof typeof widthClasses] || widthClasses[12];
}

/**
 * Map offset to responsive Tailwind grid column start classes
 * Using container queries for responsive offset behavior
 * Mobile: no offset (stack vertically)
 * @md (448px): apply offset
 * @lg (576px): intermediate breakpoint for smooth transitions
 * @xl (672px): maintain offset
 */
function getOffsetClass(offset: number): string {
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

  return offsetClasses[offset as keyof typeof offsetClasses] || '';
}

export default function GridLayout({ rows, className = '' }: GridLayoutProps) {
  return (
    <div className={`@container space-y-6 ${className}`}>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-1 @md:grid-cols-6 @lg:grid-cols-6 @xl:grid-cols-12 gap-4 @md:gap-6 items-start"
        >
          {row.fields.map((field, fieldIndex) => {
            const widthClass = getColumnClass(field.width);
            const offsetClass = field.offset ? getOffsetClass(field.offset) : '';
            const combinedClasses = `${widthClass} ${offsetClass}`.trim();

            return (
              <div
                key={fieldIndex}
                className={combinedClasses}
              >
                {field.element}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
