/**
 * Financial Data Demo Page
 * 
 * Demonstrates Phase 9 features:
 * - Masked input fields (IBAN, postcode, sort code, phone)
 * - Currency formatting
 * - Time and DateTime pickers
 * - Radio and Toggle fields
 */

'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import SchemaForm from '@/components/form-component/SchemaForm';
import { queryClient } from '@/lib/options/cache';
import type { FormSchema } from '@/types/schema';
import schemaData from '@/demo/schemas/financial-data.json';

const schema = schemaData as FormSchema;

export default function FinancialDataPage() {
  const handleSubmit = async (data: any) => {
    console.log('Financial Data Submitted:', data);
    alert('Form submitted successfully! Check console for data.');
    return { ok: true as const, message: 'Form submitted successfully!' };
  };

  const handleError = (errors: any) => {
    console.error('Validation Errors:', errors);
  };

  const callbacks = {
    onSubmit: handleSubmit,
    onError: handleError,
  };

  const context = {
    userId: 'demo-user',
    locale: 'en-GB',
    correlationId: `demo-${Date.now()}`,
    timestamp: new Date().toISOString(),
    formMode: 'create' as const,
    sessionId: 'demo-session',
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Financial Data Form
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Demo showcasing masked input fields, currency formatting, and enhanced field types
          </p>
        </div>

        {/* Feature highlights */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Phase 9 Features Demonstrated:</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Masked Input Fields</p>
                <p className="text-xs text-gray-500">IBAN, UK Postcode, Sort Code, E.164 Phone</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Currency Formatting</p>
                <p className="text-xs text-gray-500">GBP with symbol, thousand separators</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Time & DateTime Fields</p>
                <p className="text-xs text-gray-500">Native browser date/time pickers</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Radio & Toggle Fields</p>
                <p className="text-xs text-gray-500">Enhanced selection controls</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <SchemaForm
            schema={schema}
            callbacks={callbacks}
            context={context}
          />
        </div>

        {/* Usage notes */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">Usage Notes:</h3>
          <ul className="text-sm text-blue-800 space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Masked fields automatically format input as you type</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Currency fields show £ symbol and format with commas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>Toggle fields provide a modern alternative to checkboxes</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              <span>All fields validate format on blur (IBAN checksum, postcode pattern, etc.)</span>
            </li>
          </ul>
        </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
