/**
 * SchemaForm component
 * 
 * Main form component that renders fields from JSON Schema,
 * handles validation, and manages submission.
 */

'use client';

import React, { useState } from 'react';
import { FormProvider as RHFFormProvider } from 'react-hook-form';
import { FormProvider } from './FormContext';
import GlobalError from '@/components/validation/GlobalError';
import {
  TextField,
  TextareaField,
  NumberField,
  DateField,
  SelectField,
  CheckboxField,
  CalculatedField,
  FileUploadField,
  MaskedField,
  CurrencyField,
  TimeField,
  DateTimeField,
  RadioField,
  ToggleField,
  ArrayField,
  ObjectField,
} from '@/components/fields';
import { useFormState } from './hooks/useFormState';
import { useValidation } from './hooks/useValidation';
import { useConditionalLogic } from './hooks/useConditionalLogic';
import { useCalculatedFields } from './hooks/useCalculatedFields';
import { parseSchema, getDefaultValues } from '@/lib/schema/parser';
import { ChangeTracker } from '@/lib/utils/change-tracker';
import type { FormSchema, FieldDefinition } from '@/types/schema';
import type { FormCallbacks, CallbackContext, OnSubmitResponse } from '@/types/callbacks';

export interface SchemaFormProps {
  /** Form schema */
  schema: FormSchema;
  
  /** Callback functions */
  callbacks: FormCallbacks;
  
  /** Callback context */
  context: CallbackContext;
  
  /** Initial form data (for edit mode) */
  initialData?: Record<string, any>;
}

export default function SchemaForm({ schema, callbacks, context, initialData }: SchemaFormProps) {
  const [globalError, setGlobalError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadedData, setLoadedData] = useState<Record<string, any> | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  
  // Parse schema once
  const parsedSchema = React.useMemo(() => parseSchema(schema), [schema]);
  
  // Use loaded data or provided initialData
  const formInitialData = loadedData || initialData;
  
  // Initialize form state
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
  
  const { handleSubmit, reset, formState } = form;
  
  // Only show unsaved changes if there are actual dirty fields
  const hasDirtyFields = Object.keys(formState.dirtyFields).length > 0;
  
  // Load initial data via onLoad callback if in edit mode and no initialData provided
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount
  
  // Reset form with loaded data when it arrives
  React.useEffect(() => {
    if (loadedData) {
      const defaultValues = getDefaultValues(schema);
      reset({ ...defaultValues, ...loadedData }, { 
        keepDefaultValues: false,
        keepDirty: false,
        keepDirtyValues: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedData]); // Only reset when loadedData changes, not on every render
  
  // Initialize change tracker for edit mode
  const changeTracker = React.useMemo(() => {
    if (formInitialData) {
      const fieldPaths = parsedSchema.fields.map((f) => f.path);
      return new ChangeTracker(formInitialData, fieldPaths);
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formInitialData, parsedSchema]); // Only recreate when data or schema changes
  
  // Handle form submission
  const onSubmit = async (data: Record<string, any>) => {
    setGlobalError(undefined);
    setIsSubmitting(true);
    
    try {
      // Get changed fields
      const changedFields = changeTracker ? changeTracker.getChangedFields(data) : {};
      
      // Call onBeforeSubmit hook if provided
      let submitData = data;
      if (callbacks.onBeforeSubmit) {
        const result = await callbacks.onBeforeSubmit({ rawData: data, context });
        submitData = result.rawData;
      }
      
      // Submit form
      const result: OnSubmitResponse = await callbacks.onSubmit({
        rawData: submitData,
        changedFields,
        schemaMeta: schema.meta,
        context,
      });
      
      // Call onAfterSubmit hook if provided
      if (callbacks.onAfterSubmit) {
        await callbacks.onAfterSubmit({ result, context });
      }
      
      // Handle result
      if (!result.ok) {
        setGlobalError(result.message);
        
        // Set field-specific errors if provided
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            form.setError(field, { message });
          });
        }
      } else {
        // Form submitted successfully
      }
    } catch (error) {
      setGlobalError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Render field based on widget type
  const renderField = (path: string, field: FieldDefinition) => {
    // Skip hidden fields
    if (hiddenFields.has(path)) {
      return null;
    }
    
    const widget = parsedSchema.fieldMap.get(path)?.widget || 'text';
    const required = requiredFields.has(path) || conditionallyRequiredFields.has(path);
    const disabled = isSubmitting || readOnlyFields.has(path);
    
    const commonProps = {
      name: path,
      field,
      required,
      disabled,
    };
    
    switch (widget) {
      case 'textarea':
        return <TextareaField key={path} {...commonProps} />;
      case 'number':
      case 'integer':
        return <NumberField key={path} {...commonProps} />;
      case 'currency':
        return <CurrencyField key={path} {...commonProps} />;
      case 'date':
        return <DateField key={path} {...commonProps} />;
      case 'time':
        return <TimeField key={path} {...commonProps} />;
      case 'datetime':
        return <DateTimeField key={path} {...commonProps} />;
      case 'select':
        return <SelectField key={path} {...commonProps} />;
      case 'checkbox':
        return <CheckboxField key={path} {...commonProps} />;
      case 'radio':
        return <RadioField key={path} {...commonProps} />;
      case 'toggle':
        return <ToggleField key={path} {...commonProps} />;
      case 'masked':
        return <MaskedField key={path} {...commonProps} maskType={field.ui?.mask as any} />;
      case 'calculated':
        return <CalculatedField key={path} {...commonProps} />;
      case 'file':
        return (
          <FileUploadField
            key={path}
            name={path}
            control={form.control}
            label={field.title}
            description={field.description}
            required={required}
            disabled={disabled}
            rules={field.ui?.upload}
            onUpload={callbacks.onUpload}
          />
        );
      case 'array':
        return <ArrayField key={path} {...commonProps} />;
      case 'object':
        return <ObjectField key={path} {...commonProps} />;
      case 'text':
      default:
        // Handle object and array types that don't have explicit widget
        if (field.type === 'object') {
          return <ObjectField key={path} {...commonProps} />;
        }
        if (field.type === 'array') {
          return <ArrayField key={path} {...commonProps} />;
        }
        return <TextField key={path} {...commonProps} />;
    }
  };
  
  const submitButtonText = schema.ui?.messages?.submitText || 'Submit';
  const resetButtonText = schema.ui?.messages?.resetText || 'Reset';
  
  return (
    <FormProvider
      value={{
        schema,
        callbacks,
        context,
        mode: schema.meta.mode,
        isSubmitting,
      }}
    >
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
              
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <div className="text-gray-600 font-medium">Loading form data...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-6">
                  {Object.entries(schema.properties).map(([key, field]) =>
                    renderField(key, field)
                  )}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-200 bg-gray-50 px-8 py-5 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                {hasDirtyFields && !isLoading && (
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
                  disabled={isSubmitting || !hasDirtyFields || isLoading}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                >
                  {resetButtonText}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 shadow-sm hover:shadow-md"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    submitButtonText
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </RHFFormProvider>
    </FormProvider>
  );
}
