/**
 * Mock onLoad callback for demo purposes
 * 
 * Simulates loading existing client data from a server.
 * In production, this would fetch data from a real API.
 */

import type { OnLoadCallback } from '@/types/callbacks';

/**
 * Mock client data for edit mode demo
 */
const mockClientData = {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@example.com',
  phone: '4155551234',
  dateOfBirth: '1985-06-15',
  accountType: 'Business',
  investmentAmount: 50000,
  termsAccepted: true,
  notes: 'Existing client since 2020. Interested in expanding portfolio.',
};

/**
 * Simulate loading client data with a network delay
 */
export const mockOnLoad: OnLoadCallback = async ({ schemaMeta, context }) => {
  console.log('[mockOnLoad] Loading data for schema:', schemaMeta.id);
  console.log('[mockOnLoad] Context:', context);
  
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  // Return mock data
  return {
    initialData: mockClientData,
    meta: {
      loadedAt: new Date().toISOString(),
      source: 'mock-database',
    },
  };
};
