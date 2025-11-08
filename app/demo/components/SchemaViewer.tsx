/**
 * SchemaViewer Component
 *
 * Displays the JSON schema in a collapsible viewer with syntax highlighting.
 */

'use client';

import { useState } from 'react';
import type { FormSchema } from '@/types/schema';

interface SchemaViewerProps {
  schema: FormSchema;
  title?: string;
}

export function SchemaViewer({ schema, title = 'View Schema' }: SchemaViewerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  console.log('SchemaViewer rendered with schema:', schema?.meta?.id);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy schema:', err);
    }
  };

  return (
    <div className="mb-8 bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-90' : ''}`}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-sm font-semibold text-gray-700">{title}</span>
        </div>
        <span className="text-xs text-gray-500">
          {isOpen ? 'Hide' : 'Show'} JSON Schema
        </span>
      </button>

      {isOpen && (
        <div className="border-t border-gray-200">
          <div className="px-6 py-3 bg-gray-50 flex items-center justify-between border-b border-gray-200">
            <span className="text-xs font-medium text-gray-600">
              Schema Definition
            </span>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              {copied ? (
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Copied!</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </span>
              )}
            </button>
          </div>
          <div className="relative">
            <pre className="p-6 overflow-x-auto max-h-96 text-xs bg-gray-900 text-gray-100 font-mono">
              <code className="language-json">{JSON.stringify(schema, null, 2)}</code>
            </pre>
            <div className="absolute top-2 right-2 text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
              {Object.keys(schema.properties || {}).length} fields
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
