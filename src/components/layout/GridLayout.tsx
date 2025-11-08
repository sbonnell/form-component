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
    }>;
  }>;
  
  /** Additional CSS classes */
  className?: string;
}

/**
 * Map width to responsive Tailwind grid column classes
 * Mobile: stack vertically (col-span-1)
 * Tablet (sm): use specified width
 * Desktop (lg): maintain specified width
 */
function getColumnClass(width: number = 12): string {
  const widthClasses = {
    1: 'col-span-1',
    2: 'col-span-1 sm:col-span-2',
    3: 'col-span-1 sm:col-span-3',
    4: 'col-span-1 sm:col-span-4 lg:col-span-4',
    5: 'col-span-1 sm:col-span-5',
    6: 'col-span-1 sm:col-span-2 lg:col-span-6',
    7: 'col-span-1 sm:col-span-7',
    8: 'col-span-1 sm:col-span-4 lg:col-span-8',
    9: 'col-span-1 sm:col-span-9',
    10: 'col-span-1 sm:col-span-5 lg:col-span-10',
    11: 'col-span-1 sm:col-span-11',
    12: 'col-span-1 sm:col-span-12',
  };

  return widthClasses[width as keyof typeof widthClasses] || widthClasses[12];
}

export default function GridLayout({ rows, className = '' }: GridLayoutProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="grid grid-cols-1 sm:grid-cols-12 gap-4 sm:gap-6"
        >
          {row.fields.map((field, fieldIndex) => (
            <div
              key={fieldIndex}
              className={getColumnClass(field.width)}
            >
              {field.element}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
