/**
 * Conditional Logic Demo Page
 * 
 * Demonstrates User Story 4: Conditional Visibility and Required Fields
 * - Dynamic field visibility based on hiddenWhen rules
 * - Conditional required fields with requiredWhen rules
 * - Calculated fields with automatic updates
 */

'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import SchemaForm from '@/components/form-component/SchemaForm';
import { queryClient } from '@/lib/options/cache';
import orderFormSchema from '@/demo/schemas/order-form.json';
import type { FormSchema } from '@/types/schema';
import type { FormCallbacks } from '@/types/callbacks';

export default function ConditionalLogicDemo() {
  const [submittedData, setSubmittedData] = React.useState<Record<string, unknown> | null>(null);
  
  const callbacks: FormCallbacks = {
    onSubmit: async ({ rawData }) => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Order submitted:', rawData);
      setSubmittedData(rawData);
      
      return {
        ok: true,
        message: 'Order created successfully!',
      };
    },
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Conditional Logic Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            This form demonstrates <strong>conditional visibility</strong>, <strong>dynamic required fields</strong>, 
            and <strong>calculated fields</strong>. Watch fields show/hide and totals update automatically as you interact with the form.
          </p>
        </div>
        
        {/* Feature Highlights */}
        <div className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Conditional Visibility
            </h3>
            <p className="text-sm text-gray-600">
              Shipping fields appear only for physical products. Invoice email shown only when payment method is &ldquo;invoice&rdquo;.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Dynamic Required Fields
            </h3>
            <p className="text-sm text-gray-600">
              Shipping address becomes required when product type is physical and shipping is enabled.
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Calculated Fields
            </h3>
            <p className="text-sm text-gray-600">
              Subtotal, tax, and total are automatically calculated from quantity, price, and other values.
            </p>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Try These Interactions
          </h3>
          <ul className="space-y-2 text-sm text-blue-900">
            <li className="flex items-start">
              <span className="font-semibold mr-2 mt-0.5">•</span>
              <span>Change <strong>Product Type</strong> to &ldquo;physical&rdquo; to reveal shipping fields</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2 mt-0.5">•</span>
              <span>Check <strong>Requires Shipping</strong> to make shipping address required</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2 mt-0.5">•</span>
              <span>Enter <strong>Quantity</strong> and <strong>Unit Price</strong> to see calculated totals update</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2 mt-0.5">•</span>
              <span>Add a <strong>Discount %</strong> to see discount amount appear and final total adjust</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2 mt-0.5">•</span>
              <span>Select <strong>Payment Method: invoice</strong> to require invoice email</span>
            </li>
          </ul>
        </div>
        
        {/* Form */}
        <SchemaForm
          schema={orderFormSchema as FormSchema}
          callbacks={callbacks}
          context={{
            formMode: 'create',
            userId: 'demo-user',
            timestamp: new Date().toISOString(),
            locale: 'en-US',
            correlationId: `order-${Date.now()}`,
          }}
        />
        
        {/* Submitted Data Display */}
        {submittedData && (
          <div className="mt-10 bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="font-semibold text-green-900 mb-3 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Order Submitted Successfully
            </h3>
            <pre className="bg-white border border-green-300 rounded p-4 text-xs overflow-auto max-h-96">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </div>
        )}
        
        {/* Technical Implementation */}
        <div className="mt-10 bg-white rounded-lg shadow-md p-8 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Technical Implementation</h2>
          
          <div className="space-y-6 text-sm text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Conditional Rules</h3>
              <p className="mb-2">Fields use <code className="bg-gray-100 px-2 py-0.5 rounded">hiddenWhen</code> and <code className="bg-gray-100 px-2 py-0.5 rounded">requiredWhen</code> rules:</p>
              <pre className="bg-gray-50 border border-gray-200 rounded p-3 overflow-auto text-xs">
{`"shippingAddress": {
  "ui": {
    "hiddenWhen": {
      "or": [
        { "field": "productType", "operator": "in", 
          "value": ["digital", "service"] },
        { "field": "shippingRequired", "operator": "equals", 
          "value": false }
      ]
    },
    "requiredWhen": {
      "and": [
        { "field": "productType", "operator": "equals", 
          "value": "physical" },
        { "field": "shippingRequired", "operator": "equals", 
          "value": true }
      ]
    }
  }
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Calculated Fields</h3>
              <p className="mb-2">Totals are computed using formulas with automatic dependency tracking:</p>
              <pre className="bg-gray-50 border border-gray-200 rounded p-3 overflow-auto text-xs">
{`"logic": {
  "calculated": [
    {
      "target": "subtotal",
      "dependsOn": ["quantity", "unitPrice"],
      "formula": "quantity * unitPrice"
    },
    {
      "target": "taxAmount",
      "dependsOn": ["subtotal", "shippingCost", "taxRate"],
      "formula": "(subtotal + shippingCost) * (taxRate / 100)"
    },
    {
      "target": "finalTotal",
      "dependsOn": ["total", "discountAmount"],
      "formula": "total - discountAmount"
    }
  ]
}`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Conditional evaluator supports: equals, notEquals, in, notIn, greaterThan, lessThan, isEmpty, isNotEmpty</li>
                <li>Complex logic with AND/OR combinators for nested conditions</li>
                <li>Formula evaluator with basic arithmetic, math functions (min, max, round, floor, ceil, abs, sqrt)</li>
                <li>Topological sort ensures calculated fields evaluate in correct dependency order</li>
                <li>useConditionalLogic hook watches form values and re-evaluates conditions on change</li>
                <li>useCalculatedFields hook automatically updates computed values when dependencies change</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    </QueryClientProvider>
  );
}
