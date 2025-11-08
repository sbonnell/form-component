/**
 * Mock onSubmit callback
 * 
 * Simulates form submission to a server.
 */

import type { OnSubmitCallback, OnSubmitResponse } from '@/types/callbacks';

export const mockOnSubmit: OnSubmitCallback = async (params) => {
  const { rawData, changedFields, schemaMeta } = params;
  
  console.log('Form submitted:', {
    mode: schemaMeta.mode,
    data: rawData,
    changedFields,
  });
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Simulate random success/failure for demo
  const success = Math.random() > 0.2; // 80% success rate
  
  if (success) {
    const response: OnSubmitResponse = {
      ok: true,
      id: `client-${Date.now()}`,
      message: 'Client onboarding completed successfully!',
    };
    return response;
  } else {
    const response: OnSubmitResponse = {
      ok: false,
      message: 'Failed to process client onboarding. Please try again.',
      fieldErrors: {
        email: 'This email is already registered',
      },
    };
    return response;
  }
};
