/**
 * Basic form demo page
 * 
 * Demonstrates basic form creation with validation and submission.
 */

'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SchemaForm } from '@/components/form-component';
import { queryClient } from '@/lib/options/cache';
import { mockOnSubmit } from '@/demo/mocks/onSubmit';
import type { FormSchema } from '@/types/schema';
import type { CallbackContext } from '@/types/callbacks';
import schema from '@/demo/schemas/client-onboarding.json';

export default function BasicFormPage() {
  const context: CallbackContext = {
    userId: 'demo-user',
    locale: 'en-GB',
    correlationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    formMode: 'create',
    sessionId: 'demo-session',
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Basic Form Example</h1>
            <p className="mt-2 text-gray-600">
              Demonstrates basic form fields with validation and submission.
            </p>
          </div>
          
          <SchemaForm
            schema={schema as FormSchema}
            callbacks={{
              onSubmit: mockOnSubmit,
            }}
            context={context}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
}
