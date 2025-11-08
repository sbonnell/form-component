/**
 * WizardForm component
 * 
 * Schema-driven wizard form with step-by-step navigation.
 * Wraps SchemaForm to provide wizard layout with validation gates.
 */

'use client';

import React, { useState } from 'react';
import { FormProvider as RHFFormProvider } from 'react-hook-form';
import { FormProvider } from './FormContext';
import WizardLayout, { type WizardStep } from '@/components/layout/WizardLayout';
import {
  TextField,
  TextareaField,
  NumberField,
  DateField,
  SelectField,
  CheckboxField,
} from '@/components/fields';
import GridLayout from '@/components/layout/GridLayout';
import { useFormState } from './hooks/useFormState';
import { useValidation } from './hooks/useValidation';
import { useConditionalLogic } from './hooks/useConditionalLogic';
import { useCalculatedFields } from './hooks/useCalculatedFields';
import { parseSchema } from '@/lib/schema/parser';
import type { FormSchema, FieldDefinition } from '@/types/schema';
import type { FormCallbacks, CallbackContext, OnSubmitResponse } from '@/types/callbacks';

export interface WizardFormProps {
  /** Form schema with wizard layout definition */
  schema: FormSchema;
  
  /** Callback functions */
  callbacks: FormCallbacks;
  
  /** Callback context */
  context: CallbackContext;
  
  /** Initial form data (for edit mode) */
  initialData?: Record<string, any>;
  
  /** Custom wizard steps (optional - defaults to schema.layout.wizard.steps) */
  customSteps?: Array<{
    id: string;
    title: string;
    description?: string;
    fields: string[];
  }>;
}

export default function WizardForm({ 
  schema, 
  callbacks, 
  context, 
  initialData,
  customSteps,
}: WizardFormProps) {
  const [globalError, setGlobalError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedData, setLoadedData] = useState<Record<string, any> | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);

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

  const { handleSubmit, formState, trigger, getValues } = form;

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
        setSubmittedData(data);
        console.log('✅ Wizard completed successfully:', data);
      } else {
        setGlobalError(response.message);
        // TODO: Set field errors if provided
      }
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate specific fields (for wizard step validation)
  const validateFields = async (fields: string[]): Promise<boolean> => {
    const result = await trigger(fields as any);
    return result;
  };

  // Get wizard steps from schema or custom steps
  const wizardStepDefinitions = customSteps || schema.layout?.wizard?.steps;

  if (!wizardStepDefinitions || wizardStepDefinitions.length === 0) {
    throw new Error('WizardForm requires schema.layout.wizard.steps or customSteps prop');
  }

  // Build wizard steps with rendered content
  const wizardSteps: WizardStep[] = wizardStepDefinitions.map((stepDef: any) => ({
    id: stepDef.id,
    title: stepDef.title,
    description: stepDef.description,
    fields: stepDef.fields,
    allowIncomplete: stepDef.allowIncomplete,
    content: renderStepFields(stepDef.fields, schema.properties, readOnlyFields),
  }));

  // Create form context value
  const formContextValue = {
    schema,
    callbacks,
    context,
    mode: context.formMode,
    isSubmitting,
  };

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
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {globalError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded">
              {globalError}
            </div>
          )}

          <WizardLayout
            steps={wizardSteps}
            errors={formState.errors}
            validateFields={validateFields}
            formData={getValues()}
            onComplete={() => handleSubmit(onSubmit)()}
          />

          {/* Submitted Data Display */}
          {submittedData && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Form Submitted Successfully!
              </h3>
              <pre className="bg-white p-4 rounded border border-green-200 overflow-x-auto text-sm">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </div>
          )}
        </form>
      </RHFFormProvider>
    </FormProvider>
  );
}

/**
 * Render fields for a wizard step
 */
function renderStepFields(
  fieldKeys: string[],
  properties: Record<string, FieldDefinition>,
  readOnlyFields: Set<string>
): React.ReactNode {
  // Group fields into rows (2 fields per row based on width)
  const rows: Array<{ fields: Array<{ element: React.ReactNode; width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; offset?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 }> }> = [];
  let currentRow: Array<{ element: React.ReactNode; width?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12; offset?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 }> = [];
  let currentRowWidth = 0;

  fieldKeys.forEach((fieldKey) => {
    const field = properties[fieldKey];
    if (!field) return;

    const fieldWidth = (field.ui?.width || 12) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
    const fieldOffset = field.ui?.offset as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | undefined;
    const isReadOnly = readOnlyFields.has(fieldKey);
    const isRequired = false; // Will be checked by validation

    const fieldElement = renderField(fieldKey, field, isRequired, isReadOnly);

    // If adding this field exceeds 12 columns, start new row
    // Note: offset doesn't count toward row width, it just shifts position
    if (currentRowWidth + fieldWidth > 12) {
      rows.push({ fields: currentRow });
      currentRow = [];
      currentRowWidth = 0;
    }

    currentRow.push({
      element: fieldElement,
      width: fieldWidth,
      offset: fieldOffset,
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

    // Note: File upload not yet supported in wizard forms
    // case 'file':
    //   return <FileUploadField ... />;

    default:
      return (
        <div key={name} className="text-red-500">
          Unsupported field type: {widget}
        </div>
      );
  }
}
