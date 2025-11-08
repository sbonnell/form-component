/**
 * Form Builder Page
 *
 * Interactive form builder with live preview and schema editing.
 * Split layout: Form preview (left) and Schema editor (right)
 */

'use client';

import React, { useState, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SchemaForm, TabForm, WizardForm } from '@/components/form-component';
import { queryClient } from '@/lib/options/cache';
import { mockOnSubmit } from '@/demo/mocks/onSubmit';
import { mockOnOptions } from '@/demo/mocks/onOptions';
import type { FormSchema } from '@/types/schema';
import type { CallbackContext } from '@/types/callbacks';

// Import all schemas
import clientOnboardingSchema from '@/demo/schemas/client-onboarding.json';
import clientEditSchema from '@/demo/schemas/client-edit.json';
import tradeEntrySchema from '@/demo/schemas/trade-entry.json';
import orderFormSchema from '@/demo/schemas/order-form.json';
import documentUploadSchema from '@/demo/schemas/document-upload.json';
import employeeWizardSchema from '@/demo/schemas/employee-onboarding-wizard.json';
import employeeTabsSchema from '@/demo/schemas/employee-profile-tabs.json';
import financialDataSchema from '@/demo/schemas/financial-data.json';

interface SchemaOption {
  id: string;
  name: string;
  schema: FormSchema;
  description: string;
}

const SCHEMA_OPTIONS: SchemaOption[] = [
  {
    id: 'client-onboarding',
    name: 'Client Onboarding',
    schema: clientOnboardingSchema as FormSchema,
    description: 'Basic client registration form',
  },
  {
    id: 'client-edit',
    name: 'Client Edit',
    schema: clientEditSchema as FormSchema,
    description: 'Edit mode with data loading',
  },
  {
    id: 'trade-entry',
    name: 'Trade Entry',
    schema: tradeEntrySchema as FormSchema,
    description: 'Dynamic options with dependencies',
  },
  {
    id: 'order-form',
    name: 'Order Form',
    schema: orderFormSchema as FormSchema,
    description: 'Conditional logic and calculations',
  },
  {
    id: 'document-upload',
    name: 'Document Upload',
    schema: documentUploadSchema as FormSchema,
    description: 'File upload with validation',
  },
  {
    id: 'employee-wizard',
    name: 'Employee Wizard',
    schema: employeeWizardSchema as FormSchema,
    description: 'Multi-step wizard form',
  },
  {
    id: 'employee-tabs',
    name: 'Employee Tabs',
    schema: employeeTabsSchema as FormSchema,
    description: 'Tabbed form layout',
  },
  {
    id: 'financial-data',
    name: 'Financial Data',
    schema: financialDataSchema as FormSchema,
    description: 'Masked inputs and formatting',
  },
];

export default function FormBuilderPage() {
  const [selectedSchemaId, setSelectedSchemaId] = useState<string>('client-onboarding');
  const [selectedFormComponent, setSelectedFormComponent] = useState<'schema' | 'tabs' | 'wizard'>('schema');
  const [schemaText, setSchemaText] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState<number>(50);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Get selected schema option
  const selectedOption = SCHEMA_OPTIONS.find(opt => opt.id === selectedSchemaId);

  // Initialize schema text when schema changes
  React.useEffect(() => {
    if (selectedOption) {
      setSchemaText(JSON.stringify(selectedOption.schema, null, 2));
      setParseError(null);
    }
  }, [selectedOption]);

  // Parse schema from text
  const parsedSchema = useMemo(() => {
    try {
      const parsed = JSON.parse(schemaText);
      setParseError(null);
      return parsed as FormSchema;
    } catch (error) {
      setParseError(error instanceof Error ? error.message : 'Invalid JSON');
      return selectedOption?.schema || null;
    }
  }, [schemaText, selectedOption]);

  // Handle divider drag
  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const container = document.getElementById('builder-container');
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - rect.left) / rect.width) * 100;

      // Constrain between 20% and 80%
      if (newWidth >= 20 && newWidth <= 80) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Create callback context
  const context = useMemo<CallbackContext>(() => ({
    userId: 'builder-user',
    locale: 'en-GB',
    correlationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    formMode: 'create',
    sessionId: 'builder-session',
  }), []);

  // Determine form component based on selection and layout type
  const renderForm = () => {
    if (!parsedSchema) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">No valid schema</p>
        </div>
      );
    }

    // Use selected component type if explicitly chosen
    if (selectedFormComponent === 'wizard') {
      return (
        <WizardForm
          schema={parsedSchema}
          callbacks={{
            onSubmit: mockOnSubmit,
            onOptions: mockOnOptions,
          }}
          context={context}
        />
      );
    }

    if (selectedFormComponent === 'tabs') {
      return (
        <TabForm
          schema={parsedSchema}
          callbacks={{
            onSubmit: mockOnSubmit,
            onOptions: mockOnOptions,
          }}
          context={context}
        />
      );
    }

    // Default to SchemaForm
    return (
      <SchemaForm
        schema={parsedSchema}
        callbacks={{
          onSubmit: mockOnSubmit,
          onOptions: mockOnOptions,
        }}
        context={context}
      />
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Form Builder</h1>
              <p className="text-sm text-gray-600 mt-1">
                Live form preview with editable JSON schema
              </p>
            </div>

            {/* Selectors */}
            <div className="flex items-center gap-6">
              {/* Form Component Selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Form Component:
                </label>
                <select
                  value={selectedFormComponent}
                  onChange={(e) => setSelectedFormComponent(e.target.value as 'schema' | 'tabs' | 'wizard')}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="schema">SchemaForm</option>
                  <option value="tabs">TabForm</option>
                  <option value="wizard">WizardForm</option>
                </select>
              </div>

              {/* Schema Selector */}
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-gray-700">
                  Select Schema:
                </label>
                <select
                  value={selectedSchemaId}
                  onChange={(e) => setSelectedSchemaId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[240px]"
                >
                  {SCHEMA_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name} - {option.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Split Layout */}
        <div id="builder-container" className="flex-1 flex overflow-hidden relative">
          {/* Left Panel - Form Preview */}
          <div
            className="overflow-auto border-r border-gray-200 bg-gray-50"
            style={{ width: `${leftPanelWidth}%` }}
          >
            <div className="p-8">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Form Preview</h2>
                <p className="text-sm text-gray-600">
                  Live preview updates as you edit the schema
                </p>
              </div>

              {renderForm()}
            </div>
          </div>

          {/* Draggable Divider */}
          <div
            onMouseDown={() => setIsDragging(true)}
            className="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors duration-200 hover:w-1.5"
            style={{
              userSelect: 'none',
            }}
            title="Drag to resize panels"
          />

          {/* Right Panel - Schema Editor */}
          <div
            className="flex flex-col bg-gray-900"
            style={{ width: `${100 - leftPanelWidth}%` }}
          >
            {/* Editor Header */}
            <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-100">Schema Editor</h2>
                {parseError && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-red-900 text-red-200 border border-red-700">
                    ⚠ Parse Error
                  </span>
                )}
                {!parseError && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-900 text-green-200 border border-green-700">
                    ✓ Valid JSON
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-900 text-blue-200 border border-blue-700">
                  📐 Form Width: {Math.round(leftPanelWidth)}% ({Math.round((document.getElementById('builder-container')?.getBoundingClientRect().width || 0) * (leftPanelWidth / 100))}px)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (selectedOption) {
                      setSchemaText(JSON.stringify(selectedOption.schema, null, 2));
                      setParseError(null);
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => {
                    try {
                      const formatted = JSON.stringify(JSON.parse(schemaText), null, 2);
                      setSchemaText(formatted);
                    } catch {
                      // Ignore formatting errors
                    }
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  Format
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(schemaText);
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Error Display */}
            {parseError && (
              <div className="bg-red-900 bg-opacity-20 border-b border-red-800 px-6 py-2">
                <p className="text-sm text-red-300 font-mono">{parseError}</p>
              </div>
            )}

            {/* Code Editor */}
            <div className="flex-1 overflow-auto">
              <textarea
                value={schemaText}
                onChange={(e) => setSchemaText(e.target.value)}
                className="w-full h-full px-6 py-4 bg-gray-900 text-gray-100 font-mono text-sm leading-relaxed focus:outline-none resize-none"
                style={{
                  tabSize: 2,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                }}
                spellCheck={false}
              />
            </div>

            {/* Editor Footer */}
            <div className="bg-gray-800 border-t border-gray-700 px-6 py-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div>
                  Lines: {schemaText.split('\n').length} |
                  Characters: {schemaText.length}
                </div>
                <div>
                  {parsedSchema && Object.keys(parsedSchema.properties || {}).length > 0 && (
                    <span>Fields: {Object.keys(parsedSchema.properties || {}).length}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </QueryClientProvider>
  );
}
