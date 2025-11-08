/**
 * TabForm Demo Page
 *
 * Demonstrates tabbed form layout with:
 * - Multi-section navigation
 * - Validation indicators per tab
 * - Icon support
 * - Organized field grouping
 */

'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { TabForm } from '@/components/form-component';
import { queryClient } from '@/lib/options/cache';
import { mockOnSubmit } from '@/demo/mocks/onSubmit';
import { SchemaViewer } from '@/demo/components/SchemaViewer';
import type { FormSchema } from '@/types/schema';
import type { CallbackContext } from '@/types/callbacks';
import schema from '@/demo/schemas/employee-profile-tabs.json';

export default function TabFormPage() {
  const context = React.useMemo<CallbackContext>(() => ({
    userId: 'admin-user',
    locale: 'en-GB',
    correlationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    formMode: 'create',
    sessionId: 'demo-session',
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">TabForm Example</h1>
            <p className="mt-2 text-gray-600">
              Multi-section employee profile form with tabbed navigation and validation indicators.
            </p>
          </div>

          {/* Features */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">Features Demonstrated:</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Tabbed navigation for multi-section forms</li>
              <li>✅ Validation error indicators on tabs</li>
              <li>✅ Icon support for visual tab identification</li>
              <li>✅ Organized field grouping by logical sections</li>
              <li>✅ Responsive layout with grid system</li>
              <li>✅ Unsaved changes indicator</li>
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-yellow-900 mb-2">Try This:</h2>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Click through different tabs to see organized sections</li>
              <li>Notice the icons next to each tab title</li>
              <li>Try submitting with empty required fields - tabs with errors will show a red badge</li>
              <li>Fill in the form and see how validation indicators update in real-time</li>
              <li>Make changes and notice the &quot;Unsaved changes&quot; indicator in the footer</li>
            </ol>
          </div>

          <SchemaViewer schema={schema as FormSchema} />

          <TabForm
            schema={schema as FormSchema}
            callbacks={{
              onSubmit: mockOnSubmit,
            }}
            context={context}
          />

          {/* Technical Notes */}
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Technical Implementation</h2>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>TabForm Component:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">src/components/form-component/TabForm.tsx</code> -
                Wraps SchemaForm with tabbed navigation
              </p>
              <p>
                <strong>TabLayout:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">src/components/layout/TabLayout.tsx</code> -
                Handles tab switching and validation badge display
              </p>
              <p>
                <strong>Schema Layout:</strong> Define tabs in <code className="bg-gray-100 px-1 py-0.5 rounded">schema.layout.tabs</code> with:
              </p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">id</code>: Unique tab identifier</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">title</code>: Tab display name</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">icon</code>: Optional emoji or icon</li>
                <li><code className="bg-gray-100 px-1 py-0.5 rounded">fields</code>: Array of field names to display in this tab</li>
              </ul>
              <p className="mt-2">
                <strong>Example Schema:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">src/demo/schemas/employee-profile-tabs.json</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
