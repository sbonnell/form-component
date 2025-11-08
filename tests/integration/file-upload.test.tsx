/**
 * File upload integration test
 * 
 * Tests file upload field validation, progress tracking, and callbacks.
 */

import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { SchemaForm } from '@/components/form-component';
import { queryClient } from '@/lib/options/cache';
import type { FormSchema } from '@/types/schema';
import type { CallbackContext, OnUploadCallback } from '@/types/callbacks';

const mockContext: CallbackContext = {
  userId: 'test-user',
  locale: 'en-GB',
  correlationId: 'test-correlation-id',
  timestamp: new Date().toISOString(),
  formMode: 'create',
};

describe('File Upload', () => {
  it('renders file upload field', () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'upload-form',
        version: '1.0.0',
        title: 'Upload Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        documents: {
          type: 'string',
          title: 'Documents',
          ui: {
            widget: 'file',
            upload: {
              callback: 'upload',
              accept: ['.pdf', '.doc', '.docx'],
              maxSizeMB: 5, // 5MB
              maxFiles: 3,
            },
          },
        },
      },
    };

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onUpload: vi.fn(),
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    expect(screen.getByText(/documents/i)).toBeInTheDocument();
    expect(screen.getByText(/click.*drag.*files.*upload/i)).toBeInTheDocument();
  });

  it('validates file type constraints', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'upload-form',
        version: '1.0.0',
        title: 'Upload Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        documents: {
          type: 'string',
          title: 'Documents',
          ui: {
            widget: 'file',
            upload: {
              callback: 'upload',
              accept: ['.pdf'],
              maxSizeMB: 5,
              maxFiles: 1,
            },
          },
        },
      },
    };

    const mockOnUpload = vi.fn<OnUploadCallback>();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onUpload: mockOnUpload,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Create a file with wrong type
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });
    
    // Find file input
    const fileInput = screen.getByLabelText(/documents/i).closest('div')?.querySelector('input[type="file"]');
    expect(fileInput).toBeDefined();

    if (fileInput) {
      // Manually trigger file input change since user.upload() may not work with accept attribute
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: false,
      });
      fileInput.dispatchEvent(changeEvent);

      // Should show validation error
      await waitFor(() => {
        expect(screen.getByText(/File type "text\/plain" not allowed/i)).toBeInTheDocument();
      });

      // Should not call onUpload
      expect(mockOnUpload).not.toHaveBeenCalled();
    }
  });

  it('validates file size constraints', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'upload-form',
        version: '1.0.0',
        title: 'Upload Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        documents: {
          type: 'string',
          title: 'Documents',
          ui: {
            widget: 'file',
            upload: {
              callback: 'upload',
              accept: ['.pdf'],
              maxSizeMB: 0.001, // 1KB
              maxFiles: 1,
            },
          },
        },
      },
    };

    const mockOnUpload = vi.fn<OnUploadCallback>();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onUpload: mockOnUpload,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Create a file larger than max size
    const largeContent = new Array(2000).fill('a').join('');
    const file = new File([largeContent], 'large.pdf', { type: 'application/pdf' });
    
    const fileInput = screen.getByLabelText(/documents/i).closest('div')?.querySelector('input[type="file"]');
    expect(fileInput).toBeDefined();

    if (fileInput) {
      await act(async () => {
        await user.upload(fileInput as HTMLInputElement, file);
      });

      // Should show size validation error
      await waitFor(() => {
        expect(screen.getByText(/File size.*exceeds maximum.*0\.001MB/i)).toBeInTheDocument();
      });

      expect(mockOnUpload).not.toHaveBeenCalled();
    }
  });

  it('validates max file count', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'upload-form',
        version: '1.0.0',
        title: 'Upload Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        documents: {
          type: 'string',
          title: 'Documents',
          ui: {
            widget: 'file',
            upload: {
              callback: 'upload',
              accept: ['.pdf'],
              maxSizeMB: 5,
              maxFiles: 2,
            },
          },
        },
      },
    };

    const mockOnUpload = vi.fn<OnUploadCallback>();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onUpload: mockOnUpload,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Create 3 files (exceeds max of 2)
    const files = [
      new File(['content1'], 'file1.pdf', { type: 'application/pdf' }),
      new File(['content2'], 'file2.pdf', { type: 'application/pdf' }),
      new File(['content3'], 'file3.pdf', { type: 'application/pdf' }),
    ];
    
    const fileInput = screen.getByLabelText(/documents/i).closest('div')?.querySelector('input[type="file"]');
    expect(fileInput).toBeDefined();

    if (fileInput) {
      await act(async () => {
        await user.upload(fileInput as HTMLInputElement, files);
      });

      // Should show max files error
      await waitFor(() => {
        const errorMessages = screen.getAllByText(/Maximum 2 files allowed/i);
        expect(errorMessages.length).toBeGreaterThan(0);
      });

      expect(mockOnUpload).not.toHaveBeenCalled();
    }
  });

  it('calls onUpload callback with valid files', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'upload-form',
        version: '1.0.0',
        title: 'Upload Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        documents: {
          type: 'string',
          title: 'Documents',
          ui: {
            widget: 'file',
            upload: {
              callback: 'upload',
              accept: ['.pdf'],
              maxSizeMB: 5,
              maxFiles: 2,
            },
          },
        },
      },
    };

    const mockOnUpload = vi.fn<OnUploadCallback>().mockResolvedValue({
      files: [
        {
          fileId: 'file-1',
          name: 'test.pdf',
          size: 1024,
          mimeType: 'application/pdf',
          url: 'https://example.com/files/test.pdf',
          checksum: 'abc123',
        },
      ],
    });

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onUpload: mockOnUpload,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    
    const fileInput = screen.getByLabelText(/documents/i).closest('div')?.querySelector('input[type="file"]');
    expect(fileInput).toBeDefined();

    if (fileInput) {
      await act(async () => {
        await user.upload(fileInput as HTMLInputElement, file);
      });

      // Should call onUpload
      await waitFor(() => {
        expect(mockOnUpload).toHaveBeenCalledWith(
          expect.objectContaining({
            fieldKey: 'documents',
            files: expect.arrayContaining([
              expect.objectContaining({
                name: 'test.pdf',
                type: 'application/pdf',
              }),
            ]),
          })
        );
      });

      // Should display uploaded file
      await waitFor(() => {
        const uploadedFilesSection = screen.getByText('Uploaded Files (1)');
        expect(uploadedFilesSection).toBeInTheDocument();
        // Check that test.pdf appears in the uploaded files section
        const uploadedSection = uploadedFilesSection.closest('div');
        expect(uploadedSection?.textContent).toContain('test.pdf');
      });
    }
  });

  it('shows upload progress indicator', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'upload-form',
        version: '1.0.0',
        title: 'Upload Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        documents: {
          type: 'string',
          title: 'Documents',
          ui: {
            widget: 'file',
            upload: {
              callback: 'upload',
              accept: ['.pdf'],
              maxSizeMB: 5,
              maxFiles: 1,
            },
          },
        },
      },
    };

    // Simulate slow upload
    const mockOnUpload = vi.fn<OnUploadCallback>().mockImplementation(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return {
        files: [
          {
            fileId: 'file-1',
            name: 'test.pdf',
            size: 1024,
            mimeType: 'application/pdf',
            url: 'https://example.com/files/test.pdf',
            checksum: 'abc123',
          },
        ],
      };
    });

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onUpload: mockOnUpload,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    
    const fileInput = screen.getByLabelText(/documents/i).closest('div')?.querySelector('input[type="file"]');
    expect(fileInput).toBeDefined();

    if (fileInput) {
      await act(async () => {
        await user.upload(fileInput as HTMLInputElement, file);
      });

      // Should show uploading state (spinner icon)
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      // Wait for upload to complete
      await waitFor(() => {
        expect(screen.queryByText(/uploading/i)).not.toBeInTheDocument();
        expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
      });
    }
  });

  it('allows removing uploaded files', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'upload-form',
        version: '1.0.0',
        title: 'Upload Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        documents: {
          type: 'string',
          title: 'Documents',
          ui: {
            widget: 'file',
            upload: {
              callback: 'upload',
              accept: ['.pdf'],
              maxSizeMB: 5,
              maxFiles: 2,
            },
          },
        },
      },
    };

    const mockOnUpload = vi.fn<OnUploadCallback>().mockResolvedValue({
      files: [
        {
          fileId: 'file-1',
          name: 'test.pdf',
          size: 1024,
          mimeType: 'application/pdf',
          url: 'https://example.com/files/test.pdf',
          checksum: 'abc123',
        },
      ],
    });

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onUpload: mockOnUpload,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    
    const fileInput = screen.getByLabelText(/documents/i).closest('div')?.querySelector('input[type="file"]');
    expect(fileInput).toBeDefined();

    if (fileInput) {
      await act(async () => {
        await user.upload(fileInput as HTMLInputElement, file);
      });

      // Wait for file to appear in uploaded files section
      await waitFor(() => {
        expect(screen.getByText('Uploaded Files (1)')).toBeInTheDocument();
      });

      // Find and click remove button (should be the one in the uploaded files section)
      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      const uploadedFilesSection = screen.getByText('Uploaded Files (1)').closest('div');
      const removeButton = uploadedFilesSection?.querySelector('button[aria-label="Remove test.pdf"]');
      expect(removeButton).toBeInTheDocument();

      if (removeButton) {
        await act(async () => {
          await user.click(removeButton);
        });

        // File should be removed from uploaded files section
        await waitFor(() => {
          expect(screen.queryByText('Uploaded Files (1)')).not.toBeInTheDocument();
        });
      }
    }
  });
});
