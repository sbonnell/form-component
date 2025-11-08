'use client';

/**
 * Wizard Layout Demo Page
 * 
 * Demonstrates multi-step wizard form with:
 * - Step-by-step navigation
 * - Per-step validation
 * - Progress indicator
 * - Error tracking per step
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WizardForm } from '@/components/form-component';
import schema from '@/demo/schemas/employee-onboarding-wizard.json';
import type { FormSchema } from '@/types/schema';
import type { CallbackContext } from '@/types/callbacks';

const queryClient = new QueryClient();

export default function WizardDemoPage() {
  const context = React.useMemo<CallbackContext>(() => ({
    userId: 'demo-user',
    locale: 'en-GB',
    correlationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    formMode: 'create',
    sessionId: 'demo-session',
  }), []);

  const handleSubmit = async (params: any) => {
    console.log('📝 Wizard submitted:', params.rawData);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      ok: true as const,
      message: 'Employee onboarding completed successfully!',
    };
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Wizard Layout Demo
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Multi-step wizard form with validation gates and progress tracking.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="text-blue-600 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Step Validation</h3>
              <p className="text-sm text-gray-600">
                Each step validates before allowing navigation to the next
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="text-green-600 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-sm text-gray-600">
                Visual indicators show completed, current, and pending steps
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <div className="text-purple-600 mb-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Error Indicators</h3>
              <p className="text-sm text-gray-600">
                Steps with validation errors are clearly marked
              </p>
            </div>
          </div>

          {/* Wizard Form - Now a self-contained component! */}
          <WizardForm
            schema={schema as FormSchema}
            callbacks={{
              onSubmit: handleSubmit,
            }}
            context={context}
          />
        </div>
      </div>
    </QueryClientProvider>
  );
}
