/**
 * Dynamic Options Demo Page
 * 
 * Demonstrates User Story 3:
 * - Remote options loading with search
 * - Pagination with infinite scroll
 * - Dependent select fields (instrument depends on assetClass)
 * - Caching with TanStack Query
 */

'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import SchemaForm from '@/components/form-component/SchemaForm';
import { queryClient } from '@/lib/options/cache';
import { mockOnOptions } from '@/demo/mocks/onOptions';
import { mockOnSubmit } from '@/demo/mocks/onSubmit';
import tradeEntrySchema from '@/demo/schemas/trade-entry.json';
import type { CallbackContext } from '@/types/callbacks';
import type { FormSchema } from '@/types/schema';

const schema = tradeEntrySchema as FormSchema;

export default function DynamicOptionsPage() {
  // Create callback context
  const context = React.useMemo<CallbackContext>(() => ({
    userId: 'trader-001',
    locale: 'en-GB',
    correlationId: `dyn-${Date.now()}`,
    timestamp: new Date().toISOString(),
    formMode: 'create',
    sessionId: 'session-123',
  }), []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Dynamic Options Demo
            </h1>
            <p className="text-gray-600">
              Trade entry form with remote options, search, pagination, and field dependencies
            </p>
          </div>

          {/* Features */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-blue-900 mb-2">Features Demonstrated:</h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Remote options loading with onOptions callback</li>
              <li>✅ Search filtering (type in select fields to search)</li>
              <li>✅ Infinite scroll pagination (scroll down in Counterparty field)</li>
              <li>✅ Dependent fields (Instrument options change when Asset Class changes)</li>
              <li>✅ TanStack Query caching (10-minute TTL)</li>
              <li>✅ Error handling with retry button</li>
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h2 className="font-semibold text-yellow-900 mb-2">Try This:</h2>
            <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
              <li>Select an <strong>Asset Class</strong> (e.g., &ldquo;Equity&rdquo;)</li>
              <li>Notice how <strong>Instrument</strong> options are filtered to only show stocks</li>
              <li>Change Asset Class to &ldquo;Foreign Exchange&rdquo; - Instrument options update automatically</li>
              <li>In <strong>Counterparty</strong>, type to search (e.g., &ldquo;10&rdquo;) - options filter in real-time</li>
              <li>Scroll down in Counterparty dropdown to load more options (pagination)</li>
            </ol>
          </div>

          {/* Form */}
          <SchemaForm
            schema={schema}
            context={context}
            callbacks={{
              onOptions: mockOnOptions,
              onSubmit: mockOnSubmit,
            }}
          />

          {/* Technical Notes */}
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Technical Implementation</h2>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Options Fetcher:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">src/lib/options/fetcher.ts</code> - 
                Wraps TanStack Query with form context awareness
              </p>
              <p>
                <strong>Cache:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">src/lib/options/cache.ts</code> - 
                Configures 10-minute TTL and infinite query support
              </p>
              <p>
                <strong>SelectField Enhancement:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">src/components/fields/SelectField.tsx</code> - 
                Custom dropdown with search, pagination, and dependency tracking
              </p>
              <p>
                <strong>Mock Callback:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">src/demo/mocks/onOptions.ts</code> - 
                Simulates 800ms network delay and paginated responses
              </p>
              <p>
                <strong>Schema:</strong> <code className="bg-gray-100 px-1 py-0.5 rounded">src/demo/schemas/trade-entry.json</code> - 
                Defines optionsSource and dependsOn relationships
              </p>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
