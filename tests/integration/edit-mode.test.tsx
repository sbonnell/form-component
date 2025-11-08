/**
 * Edit mode integration tests
 * 
 * Tests edit mode functionality including:
 * - Initial data population from initialData prop
 * - Initial data loading via onLoad callback
 * - Change tracking for modified fields
 * - changedFields map in submission
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { SchemaForm } from '@/components/form-component';
import { queryClient } from '@/lib/options/cache';
import type { FormSchema } from '@/types/schema';
import type { CallbackContext, OnLoadCallback, OnSubmitCallback } from '@/types/callbacks';

const testSchema: FormSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  meta: {
    id: 'test-edit',
    version: '1.0.0',
    title: 'Test Edit Form',
    mode: 'edit',
  },
  type: 'object',
  properties: {
    firstName: {
      type: 'string',
      title: 'First Name',
      ui: {
        widget: 'text',
        width: 12,
      },
    },
    lastName: {
      type: 'string',
      title: 'Last Name',
      ui: {
        widget: 'text',
        width: 12,
      },
    },
    email: {
      type: 'string',
      title: 'Email',
      ui: {
        widget: 'text',
        width: 12,
      },
    },
  },
  required: ['firstName', 'lastName', 'email'],
};

const testContext: CallbackContext = {
  userId: 'test-user',
  locale: 'en-GB',
  correlationId: 'test-correlation-id',
  timestamp: new Date().toISOString(),
  formMode: 'edit',
};

describe('Edit Mode Integration Tests', () => {
  it('should populate form with initialData prop', async () => {
    const initialData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };
    
    const mockOnSubmit = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={testContext}
          initialData={initialData}
        />
      </QueryClientProvider>
    );
    
    // Verify fields are populated
    await waitFor(() => {
      expect(screen.getByLabelText('First Name')).toHaveValue('John');
    });
    expect(screen.getByLabelText('Last Name')).toHaveValue('Doe');
    expect(screen.getByLabelText('Email')).toHaveValue('john.doe@example.com');
  });
  
  it('should load data via onLoad callback when no initialData provided', async () => {
    const loadedData = {
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
    };
    
    const mockOnLoad: OnLoadCallback = vi.fn().mockResolvedValue({
      initialData: loadedData,
    });
    
    const mockOnSubmit = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onLoad: mockOnLoad, onSubmit: mockOnSubmit }}
          context={testContext}
        />
      </QueryClientProvider>
    );
    
    // Should show loading state initially
    expect(screen.getByText(/Loading form data/i)).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(mockOnLoad).toHaveBeenCalledWith({
        schemaMeta: testSchema.meta,
        context: testContext,
      });
    });
    
    // Verify fields are populated
    await waitFor(() => {
      expect(screen.getByLabelText('First Name')).toHaveValue('Jane');
      expect(screen.getByLabelText('Last Name')).toHaveValue('Smith');
      expect(screen.getByLabelText('Email')).toHaveValue('jane.smith@example.com');
    });
  });
  
  it('should track changed fields and include in submission', async () => {
    const user = userEvent.setup();
    const initialData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };
    
    const mockOnSubmit: OnSubmitCallback = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={testContext}
          initialData={initialData}
        />
      </QueryClientProvider>
    );
    
    // Wait for form to be ready and modify only the email field
    const emailInput = await screen.findByLabelText('Email');
    await user.clear(emailInput);
    await user.type(emailInput, 'newemail@example.com');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    // Verify onSubmit was called with changedFields
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          rawData: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'newemail@example.com',
          },
          changedFields: {
            email: true,
          },
          schemaMeta: testSchema.meta,
          context: testContext,
        })
      );
    });
  });
  
  it('should track multiple changed fields', async () => {
    const user = userEvent.setup();
    const initialData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };
    
    const mockOnSubmit: OnSubmitCallback = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={testContext}
          initialData={initialData}
        />
      </QueryClientProvider>
    );
    
    // Wait for form to be ready, then modify firstName and email
    const firstNameInput = await screen.findByLabelText('First Name');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Jane');

    const emailInput = screen.getByLabelText('Email');
    await user.clear(emailInput);
    await user.type(emailInput, 'jane.doe@example.com');
    
    // Submit form
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    // Verify both fields are marked as changed
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          changedFields: {
            firstName: true,
            email: true,
          },
        })
      );
    });
  });
  
  it('should have empty changedFields when no fields modified', async () => {
    const user = userEvent.setup();
    const initialData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };
    
    const mockOnSubmit: OnSubmitCallback = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={testContext}
          initialData={initialData}
        />
      </QueryClientProvider>
    );
    
    // Submit without modifying any fields
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);
    
    // Verify changedFields is empty
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          changedFields: {},
        })
      );
    });
  });
});
