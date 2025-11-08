/**
 * FieldGroup component
 * 
 * Groups related fields together using semantic HTML fieldset/legend.
 * Provides visual grouping with optional title and description.
 */

'use client';

import React from 'react';

export interface FieldGroupProps {
  /** Group title (rendered as legend) */
  title?: string;
  
  /** Group description/help text */
  description?: string;
  
  /** Field elements to group */
  children: React.ReactNode;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Whether group is collapsible */
  collapsible?: boolean;
  
  /** Initial collapsed state (if collapsible) */
  defaultCollapsed?: boolean;
}

export default function FieldGroup({
  title,
  description,
  children,
  className = '',
  collapsible = false,
  defaultCollapsed = false,
}: FieldGroupProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  const toggleCollapse = () => {
    if (collapsible) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <fieldset className={`border border-gray-200 rounded-lg p-6 ${className}`}>
      {title && (
        <legend className="px-3 text-base font-semibold text-gray-900">
          {collapsible ? (
            <button
              type="button"
              onClick={toggleCollapse}
              className="flex items-center space-x-2 hover:text-blue-600 transition-colors"
              aria-expanded={!isCollapsed}
            >
              <svg
                className={`w-4 h-4 transition-transform ${
                  isCollapsed ? '' : 'rotate-90'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              <span>{title}</span>
            </button>
          ) : (
            title
          )}
        </legend>
      )}
      
      {description && !isCollapsed && (
        <p className="text-sm text-gray-600 mb-4 mt-2">{description}</p>
      )}
      
      {!isCollapsed && (
        <div className="space-y-4 mt-4">{children}</div>
      )}
    </fieldset>
  );
}
