/**
 * FormContext
 * 
 * React Context for sharing form state across all field components.
 * Provides access to callbacks, form metadata, and shared utilities.
 */

'use client';

import React, { createContext, useContext } from 'react';
import type { FormSchema } from '@/types/schema';
import type { FormCallbacks, CallbackContext } from '@/types/callbacks';

export interface FormContextValue {
  /** Form schema */
  schema: FormSchema;
  
  /** Callback functions */
  callbacks: FormCallbacks;
  
  /** Callback context */
  context: CallbackContext;
  
  /** Form mode */
  mode: 'create' | 'edit';
  
  /** Whether form is submitting */
  isSubmitting: boolean;
}

const FormContext = createContext<FormContextValue | null>(null);

export interface FormProviderProps {
  value: FormContextValue;
  children: React.ReactNode;
}

export function FormProvider({ value, children }: FormProviderProps) {
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormContext(): FormContextValue {
  const context = useContext(FormContext);
  
  if (!context) {
    throw new Error('useFormContext must be used within FormProvider');
  }
  
  return context;
}
