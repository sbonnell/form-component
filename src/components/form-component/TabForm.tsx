/**
 * TabForm component
 * 
 * Schema-driven form with tab-based layout.
 * Wraps SchemaForm to provide tabbed navigation with validation indicators.
 */

'use client';

import React, { useState } from 'react';
import { FormProvider as RHFFormProvider } from 'react-hook-form';
import { FormProvider } from './FormContext';
import TabLayout, { type TabSection } from '@/components/layout/TabLayout';
import GridLayout from '@/components/layout/GridLayout';
import {
  TextField,
  TextareaField,
  NumberField,
  DateField,
  SelectField,
  CheckboxField,
  CalculatedField,
} from '@/components/fields';
import GlobalError from '@/components/validation/GlobalError';
import { useFormState } from './hooks/useFormState';
import { useValidation } from './hooks/useValidation';
import { useConditionalLogic } from './hooks/useConditionalLogic';
import { useCalculatedFields } from './hooks/useCalculatedFields';
import { parseSchema } from '@/lib/schema/parser';
import type { FormSchema, FieldDefinition } from '@/types/schema';
import type { FormCallbacks, CallbackContext, OnSubmitResponse } from '@/types/callbacks';

export interface TabFormProps {
  /** Form schema with tab layout definition */
  schema: FormSchema;
  
  /** Callback functions */
  callbacks: FormCallbacks;
  
  /** Callback context */
  context: CallbackContext;
  
  /** Initial form data (for edit mode) */
  initialData?: Record<string, any>;
  
  /** Custom tab sections (optional - defaults to schema.layout.tabs) */
  customTabs?: Array<{
    id: string;
    title: string;
    icon?: string;
    fields: string[];
  }>;
}

export default function TabForm({ 
  schema, 
  callbacks, 
  context, 
  initialData,
  customTabs,
}: TabFormProps) {
  const [globalError, setGlobalError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedData, setLoadedData] = useState<Record<string, any> | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  // Parse schema once
  const parsedSchema = React.useMemo(() => parseSchema(schema), [schema]);
  
  // Use loaded data or provided initialData
  const formInitialData = loadedData || initialData;
  
  // Initialize form state with validation
  const form = useFormState({
    schema,
    initialData: formInitialData,
    requiredFields: new Set(schema.required || []),
  });
  
  // Setup validation
  const { requiredFields } = useValidation({ schema, form });
  
  // Setup conditional logic
  const { hiddenFields, conditionallyRequiredFields, readOnlyFields } = useConditionalLogic({
    properties: schema.properties,
    control: form.control,
    baseRequiredFields: schema.required,
  });
  
  // Setup calculated fields
  useCalculatedFields({
    calculatedFields: schema.logic?.calculated,
    control: form.control,
    setValue: form.setValue,
  });

  const { handleSubmit, formState, reset } = form;
  const hasDirtyFields = Object.keys(formState.dirtyFields).length > 0;

  // Load initial data via onLoad callback if in edit mode
  React.useEffect(() => {
    const loadData = async () => {
      if (context.formMode === 'edit' && !initialData && callbacks.onLoad) {
        setIsLoading(true);
        try {
          const response = await callbacks.onLoad({
            schemaMeta: schema.meta,
            context,
          });
          setLoadedData(response.initialData);
        } catch (error) {
          setGlobalError(error instanceof Error ? error.message : 'Failed to load form data');
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadData();
  }, [context.formMode, initialData, callbacks, schema.meta, context]);

  // Handle form submission
  const onSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    setGlobalError(undefined);

    try {
      const response: OnSubmitResponse = await callbacks.onSubmit({
        rawData: data,
        changedFields: {}, // TODO: Track changed fields
        schemaMeta: schema.meta,
        context,
      });

      if (response.ok) {
        console.log('✅ Form submitted successfully:', data);
        reset(data); // Reset with submitted data
      } else {
        setGlobalError(response.message);
      }
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get tab sections from schema or custom tabs
  const tabDefinitions = customTabs || schema.layout?.tabs;

  // If no tabs defined, fall back to SchemaForm behavior by grouping all fields into a single tab
  const finalTabDefinitions = tabDefinitions && tabDefinitions.length > 0
    ? tabDefinitions
    : [{
        id: 'default',
        title: schema.meta.title || 'Form',
        fields: Object.keys(schema.properties || {}),
      }];

  // Build tab sections with rendered content
  const tabSections: TabSection[] = finalTabDefinitions.map((tabDef: any) => ({
    id: tabDef.id,
    title: tabDef.title,
    icon: tabDef.icon,
    fields: tabDef.fields,
    content: renderTabFields(tabDef.fields, schema.properties, requiredFields, readOnlyFields),
  }));

  // Create form context value
  const formContextValue = {
    schema,
    callbacks,
    context,
    mode: context.formMode,
    isSubmitting,
  };

  const submitButtonText = schema.ui?.messages?.submitText || 'Submit';
  const resetButtonText = schema.ui?.messages?.resetText || 'Reset';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600">Loading form data...</div>
      </div>
    );
  }

  return (
    <FormProvider value={formContextValue}>
      <RHFFormProvider {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white shadow-md rounded-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{schema.meta.title}</h2>
              {schema.meta.description && (
                <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
                  {schema.meta.description}
                </p>
              )}
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              <GlobalError
                message={globalError}
                title="Submission Error"
                onDismiss={() => setGlobalError(undefined)}
              />

              <TabLayout
                tabs={tabSections}
                errors={formState.errors}
              />
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-8 py-5 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {hasDirtyFields && (
                  <span className="inline-flex items-center">
                    <span className="h-2 w-2 bg-amber-400 rounded-full mr-2 animate-pulse"></span>
                    Unsaved changes
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => reset()}
                  disabled={isSubmitting || !hasDirtyFields}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                >
                  {resetButtonText}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm hover:shadow-md"
                >
                  {isSubmitting ? 'Submitting...' : submitButtonText}
                </button>
              </div>
            </div>
          </div>
        </form>
      </RHFFormProvider>
    </FormProvider>
  );
}

/**
 * Render fields for a tab section
 */
function renderTabFields(
  fieldKeys: string[],
  properties: Record<string, FieldDefinition>,
  requiredFields: Set<string>,
  readOnlyFields: Set<string>
): React.ReactNode {
  // Group fields into rows based on width
  const rows: Array<{ fields: Array<{ element: React.ReactNode; width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 }> }> = [];
  let currentRow: Array<{ element: React.ReactNode; width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 }> = [];
  let currentRowWidth = 0;

  fieldKeys.forEach((fieldKey) => {
    const field = properties[fieldKey];
    if (!field) return;

    const fieldWidth = (field.ui?.width || 12) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    const isReadOnly = readOnlyFields.has(fieldKey);
    const isRequired = requiredFields.has(fieldKey);

    const fieldElement = renderField(fieldKey, field, isRequired, isReadOnly);

    // If adding this field exceeds 12 columns, start new row
    if (currentRowWidth + fieldWidth > 12) {
      rows.push({ fields: currentRow });
      currentRow = [];
      currentRowWidth = 0;
    }

    currentRow.push({
      element: fieldElement,
      width: fieldWidth,
    });
    currentRowWidth += fieldWidth;
  });

  // Add remaining fields
  if (currentRow.length > 0) {
    rows.push({ fields: currentRow });
  }

  return <GridLayout rows={rows} />;
}

/**
 * Render a single field based on its type
 */
function renderField(
  name: string,
  field: FieldDefinition,
  required: boolean,
  disabled: boolean
): React.ReactNode {
  const widget = field.ui?.widget || 'text';

  switch (widget) {
    case 'text':
      return (
        <TextField
          key={name}
          name={name}
          field={field}
          required={required}
          disabled={disabled}
        />
      );

    case 'textarea':
      return (
        <TextareaField
          key={name}
          name={name}
          field={field}
          required={required}
          disabled={disabled}
        />
      );

    case 'number':
      return (
        <NumberField
          key={name}
          name={name}
          field={field}
          required={required}
          disabled={disabled}
        />
      );

    case 'date':
      return (
        <DateField
          key={name}
          name={name}
          field={field}
          required={required}
          disabled={disabled}
        />
      );

    case 'select':
      return (
        <SelectField
          key={name}
          name={name}
          field={field}
          required={required}
          disabled={disabled}
        />
      );

    case 'checkbox':
      return (
        <CheckboxField
          key={name}
          name={name}
          field={field}
          required={required}
          disabled={disabled}
        />
      );

    case 'calculated':
      return (
        <CalculatedField
          key={name}
          name={name}
          field={field}
        />
      );

    default:
      return (
        <div key={name} className="text-red-500">
          Unsupported field type: {widget}
        </div>
      );
  }
}
