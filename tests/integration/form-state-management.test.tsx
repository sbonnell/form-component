/**
 * Form state management integration tests
 * 
 * Tests for bugs related to:
 * - Unsaved changes indicator appearing on initial load
 * - Form dirty state management
 * - Edit mode data loading
 */

import { describe, it, expect, vi } from 'vitest';
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
    id: 'test-form',
    version: '1.0.0',
    title: 'Test Form',
    mode: 'create',
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
    email: {
      type: 'string',
      title: 'Email',
      ui: {
        widget: 'text',
        width: 12,
      },
    },
  },
  required: ['firstName', 'email'],
};

const createContext = (mode: 'create' | 'edit' = 'create'): CallbackContext => ({
  userId: 'test-user',
  locale: 'en-GB',
  correlationId: 'test-correlation',
  timestamp: new Date().toISOString(),
  formMode: mode,
});

describe('Form State Management - Unsaved Changes Indicator', () => {
  it('should NOT show "Unsaved changes" on initial load (create mode)', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={createContext('create')}
        />
      </QueryClientProvider>
    );
    
    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    });
    
    // "Unsaved changes" should NOT appear immediately
    expect(screen.queryByText(/Unsaved changes/i)).not.toBeInTheDocument();
  });
  
  it('should NOT show "Unsaved changes" on initial load (edit mode with onLoad)', async () => {
    const mockOnLoad: OnLoadCallback = vi.fn().mockResolvedValue({
      initialData: {
        firstName: 'John',
        email: 'john@example.com',
      },
    });
    
    const mockOnSubmit = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={{ ...testSchema, meta: { ...testSchema.meta, mode: 'edit' } }}
          callbacks={{ onLoad: mockOnLoad, onSubmit: mockOnSubmit }}
          context={createContext('edit')}
        />
      </QueryClientProvider>
    );
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByLabelText('First Name')).toHaveValue('John');
    });
    
    // "Unsaved changes" should NOT appear after data loads
    expect(screen.queryByText(/Unsaved changes/i)).not.toBeInTheDocument();
  });
  
  it('should NOT show "Unsaved changes" on initial load (edit mode with initialData)', async () => {
    const initialData = {
      firstName: 'Jane',
      email: 'jane@example.com',
    };
    
    const mockOnSubmit = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={{ ...testSchema, meta: { ...testSchema.meta, mode: 'edit' } }}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={createContext('edit')}
          initialData={initialData}
        />
      </QueryClientProvider>
    );
    
    // Wait for form to render with data
    await waitFor(() => {
      expect(screen.getByLabelText('First Name')).toHaveValue('Jane');
    });
    
    // "Unsaved changes" should NOT appear
    expect(screen.queryByText(/Unsaved changes/i)).not.toBeInTheDocument();
  });
  
  it('should SHOW "Unsaved changes" after user modifies a field', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={createContext('create')}
        />
      </QueryClientProvider>
    );
    
    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    });
    
    // Initially no unsaved changes
    expect(screen.queryByText(/Unsaved changes/i)).not.toBeInTheDocument();
    
    // Modify a field
    const firstNameInput = screen.getByLabelText('First Name');
    await user.type(firstNameInput, 'John');
    
    // Now "Unsaved changes" should appear
    await waitFor(() => {
      expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();
    });
  });
  
  it('should hide "Unsaved changes" after form reset', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={createContext('create')}
        />
      </QueryClientProvider>
    );
    
    // Modify a field
    const firstNameInput = screen.getByLabelText('First Name');
    await user.type(firstNameInput, 'John');
    
    // Verify unsaved changes appears
    await waitFor(() => {
      expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();
    });
    
    // Click reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    await user.click(resetButton);
    
    // "Unsaved changes" should disappear
    await waitFor(() => {
      expect(screen.queryByText(/Unsaved changes/i)).not.toBeInTheDocument();
    });
  });
  
  it('should disable reset button when no changes', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={createContext('create')}
        />
      </QueryClientProvider>
    );
    
    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    });
    
    // Reset button should be disabled initially
    const resetButton = screen.getByRole('button', { name: /reset/i });
    expect(resetButton).toBeDisabled();
  });
  
  it('should enable reset button when there are changes', async () => {
    const user = userEvent.setup();
    const mockOnSubmit = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={createContext('create')}
        />
      </QueryClientProvider>
    );
    
    // Modify a field
    const firstNameInput = screen.getByLabelText('First Name');
    await user.type(firstNameInput, 'John');
    
    // Reset button should now be enabled
    await waitFor(() => {
      const resetButton = screen.getByRole('button', { name: /reset/i });
      expect(resetButton).not.toBeDisabled();
    });
  });
  
  it('should properly track dirty state in edit mode after data loads', async () => {
    const user = userEvent.setup();
    
    const mockOnLoad: OnLoadCallback = vi.fn().mockResolvedValue({
      initialData: {
        firstName: 'Original',
        email: 'original@example.com',
      },
    });
    
    const mockOnSubmit = vi.fn().mockResolvedValue({ ok: true });
    
    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={{ ...testSchema, meta: { ...testSchema.meta, mode: 'edit' } }}
          callbacks={{ onLoad: mockOnLoad, onSubmit: mockOnSubmit }}
          context={createContext('edit')}
        />
      </QueryClientProvider>
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByLabelText('First Name')).toHaveValue('Original');
    });
    
    // No unsaved changes initially
    expect(screen.queryByText(/Unsaved changes/i)).not.toBeInTheDocument();
    
    // Modify the field
    const firstNameInput = screen.getByLabelText('First Name');
    await user.clear(firstNameInput);
    await user.type(firstNameInput, 'Modified');
    
    // Should now show unsaved changes
    await waitFor(() => {
      expect(screen.getByText(/Unsaved changes/i)).toBeInTheDocument();
    });
  });
  
  it('should not have false positive dirty state from context re-renders', async () => {
    const mockOnSubmit = vi.fn().mockResolvedValue({ ok: true });
    
    // Simulate a parent component that re-renders with new context objects
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={createContext('create')}
        />
      </QueryClientProvider>
    );
    
    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    });
    
    // No unsaved changes
    expect(screen.queryByText(/Unsaved changes/i)).not.toBeInTheDocument();
    
    // Force re-render with new context object (same values but new reference)
    rerender(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={testSchema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={createContext('create')}
        />
      </QueryClientProvider>
    );
    
    // Still no unsaved changes (this was the bug)
    await waitFor(() => {
      expect(screen.queryByText(/Unsaved changes/i)).not.toBeInTheDocument();
    });
  });
});
