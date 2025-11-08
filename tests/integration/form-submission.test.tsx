/**
 * Form submission integration test
 * 
 * Tests basic form rendering, validation, and submission.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { SchemaForm } from '@/components/form-component';
import { queryClient } from '@/lib/options/cache';
import type { FormSchema } from '@/types/schema';
import type { CallbackContext, OnSubmitCallback } from '@/types/callbacks';

const mockSchema: FormSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  meta: {
    id: 'test-form',
    version: '1.0.0',
    title: 'Test Form',
    mode: 'create',
  },
  type: 'object',
  properties: {
    name: {
      type: 'string',
      title: 'Name',
      minLength: 2,
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email',
    },
  },
  required: ['name', 'email'],
};

const mockContext: CallbackContext = {
  userId: 'test-user',
  locale: 'en-GB',
  correlationId: 'test-correlation-id',
  timestamp: new Date().toISOString(),
  formMode: 'create',
};

describe('Form Submission', () => {
  it('renders form fields from schema', () => {
    const mockOnSubmit: OnSubmitCallback = vi.fn();
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={mockSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={mockContext}
        />
      </QueryClientProvider>
    );
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });
  
  it('validates required fields', async () => {
    const mockOnSubmit: OnSubmitCallback = vi.fn();
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={mockSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={mockContext}
        />
      </QueryClientProvider>
    );
    
    // Submit without filling fields
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    // Should not call onSubmit due to validation
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
  
  it('submits valid form data', async () => {
    const mockOnSubmit: OnSubmitCallback = vi.fn().mockResolvedValue({
      ok: true,
      message: 'Success',
    });
    const user = userEvent.setup();
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={mockSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={mockContext}
        />
      </QueryClientProvider>
    );
    
    // Fill in fields
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    
    // Submit form
    await user.click(screen.getByRole('button', { name: /submit/i }));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          rawData: expect.objectContaining({
            name: 'John Doe',
            email: 'john@example.com',
          }),
        })
      );
    });
  });
});
