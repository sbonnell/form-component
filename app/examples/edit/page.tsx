/**
 * Edit form demo page
 * 
 * Demonstrates edit mode with pre-populated data, change tracking,
 * and onLoad callback integration.
 */

'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SchemaForm } from '@/components/form-component';
import { queryClient } from '@/lib/options/cache';
import { mockOnSubmit } from '@/demo/mocks/onSubmit';
import { mockOnLoad } from '@/demo/mocks/onLoad';
import type { FormSchema } from '@/types/schema';
import type { CallbackContext } from '@/types/callbacks';
import schema from '@/demo/schemas/client-edit.json';

export default function EditFormPage() {
  const context = React.useMemo<CallbackContext>(() => ({
    userId: 'demo-user',
    locale: 'en-GB',
    correlationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    formMode: 'edit',
    sessionId: 'demo-session',
  }), []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Edit Form Example</h1>
            <p className="mt-2 text-gray-600">
              Demonstrates edit mode with pre-populated data and change tracking.
              Modify some fields and submit to see which fields were changed.
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 What to Try:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Form loads with existing client data via onLoad callback</li>
                <li>• Modify a few fields (e.g., phone number, investment amount)</li>
                <li>• Submit the form and check console logs</li>
                <li>• Notice the changedFields map shows only modified fields</li>
              </ul>
            </div>
          </div>
          
          <SchemaForm
            schema={schema as FormSchema}
            callbacks={{
              onLoad: mockOnLoad,
              onSubmit: mockOnSubmit,
            }}
            context={context}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
}
