/**
 * GlobalError component
 * 
 * Displays global form errors (e.g., submission failures) as a banner
 * at the top of the form.
 */

'use client';

import React from 'react';

export interface GlobalErrorProps {
  /** Error message */
  message?: string;
  
  /** Optional error title */
  title?: string;
  
  /** Callback to dismiss error */
  onDismiss?: () => void;
}

export default function GlobalError({ message, title, onDismiss }: GlobalErrorProps) {
  if (!message) return null;

  return (
    <div
      className="bg-red-50 border-l-4 border-red-400 p-4 mb-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium text-red-800 mb-1">{title}</h3>
          )}
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="ml-4 text-red-500 hover:text-red-700"
            aria-label="Dismiss error"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
