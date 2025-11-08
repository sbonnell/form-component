/**
 * ValidationMessage component
 * 
 * Displays inline validation error messages for individual fields.
 */

'use client';

import React from 'react';

export interface ValidationMessageProps {
  /** Error message to display */
  message?: string;
  
  /** Field identifier for accessibility */
  fieldId?: string;
}

export default function ValidationMessage({ message, fieldId }: ValidationMessageProps) {
  if (!message) return null;

  return (
    <p
      className="text-sm text-red-600 mt-1"
      role="alert"
      aria-live="polite"
      id={fieldId ? `${fieldId}-error` : undefined}
    >
      {message}
    </p>
  );
}
