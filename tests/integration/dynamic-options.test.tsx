/**
 * Dynamic options integration test
 * 
 * Tests remote option loading with search, pagination, and dependencies.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { SchemaForm } from '@/components/form-component';
import { queryClient } from '@/lib/options/cache';
import type { FormSchema } from '@/types/schema';
import type { CallbackContext, OnOptionsCallback, OnOptionsResponse } from '@/types/callbacks';

const mockSchema: FormSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  meta: {
    id: 'dynamic-options-form',
    version: '1.0.0',
    title: 'Dynamic Options Test Form',
    mode: 'create',
  },
  type: 'object',
  properties: {
    country: {
      type: 'string',
      title: 'Country',
      ui: {
        widget: 'select',
        optionsSource: 'countries',
      },
    },
    city: {
      type: 'string',
      title: 'City',
      ui: {
        widget: 'select',
        optionsSource: 'cities',
        dependsOn: ['country'],
      },
    },
    tags: {
      type: 'array',
      title: 'Tags',
      ui: {
        widget: 'multiselect',
        optionsSource: 'tags',
      },
    },
  },
  required: ['country'],
};

const mockContext: CallbackContext = {
  userId: 'test-user',
  locale: 'en-GB',
  correlationId: 'test-correlation-id',
  timestamp: new Date().toISOString(),
  formMode: 'create',
};

describe('Dynamic Options', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  it('loads options from onOptions callback', async () => {
    const mockOnOptions = vi.fn<OnOptionsCallback>().mockResolvedValue({
      options: [
        { value: 'uk', label: 'United Kingdom' },
        { value: 'us', label: 'United States' },
        { value: 'ca', label: 'Canada' },
      ],
    });

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={mockSchema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onOptions: mockOnOptions,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Click country select to open dropdown
    const countryButton = screen.getByRole('button', { name: /select an option/i });
    await userEvent.click(countryButton);

    // Wait for options to load
    await waitFor(() => {
      expect(mockOnOptions).toHaveBeenCalledWith(
        expect.objectContaining({
          sourceName: 'countries',
          searchQuery: '',
        })
      );
    });

    // Verify options are displayed
    await waitFor(() => {
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
      expect(screen.getByText('United States')).toBeInTheDocument();
      expect(screen.getByText('Canada')).toBeInTheDocument();
    });
  });

  it('filters options with search query', async () => {
    const mockOnOptions: OnOptionsCallback = vi.fn()
      .mockImplementation(async ({ searchQuery }: { searchQuery?: string }) => {
        const allOptions = [
          { value: 'uk', label: 'United Kingdom' },
          { value: 'us', label: 'United States' },
          { value: 'ca', label: 'Canada' },
        ];

        const filtered = searchQuery
          ? allOptions.filter(opt => 
              opt.label.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : allOptions;

        return {
          options: filtered,
        };
      });

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={mockSchema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onOptions: mockOnOptions,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Open country dropdown
    const countryButton = screen.getByRole('button', { name: /select an option/i });
    await user.click(countryButton);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    });

    // Type search query
    const searchInput = screen.getByPlaceholderText(/search/i);
    await user.type(searchInput, 'united');

    // Wait for filtered results (debounced)
    await waitFor(
      () => {
        expect(screen.getByText('United Kingdom')).toBeInTheDocument();
        expect(screen.getByText('United States')).toBeInTheDocument();
      },
      { timeout: 1000 }
    );
  });

  it('refreshes dependent field options when parent changes', async () => {
    const mockOnOptions: OnOptionsCallback = vi.fn()
      .mockImplementation(async ({ sourceName, dependentValues }: { sourceName?: string; dependentValues?: Record<string, unknown> }) => {
        if (sourceName === 'countries') {
          return {
            options: [
              { value: 'uk', label: 'United Kingdom' },
              { value: 'us', label: 'United States' },
            ],
          };
        }

        if (sourceName === 'cities') {
          const country = dependentValues?.country;
          
          if (country === 'uk') {
            return {
              options: [
                { value: 'london', label: 'London' },
                { value: 'manchester', label: 'Manchester' },
              ],
            };
          }

          if (country === 'us') {
            return {
              options: [
                { value: 'newyork', label: 'New York' },
                { value: 'losangeles', label: 'Los Angeles' },
              ],
            };
          }
        }

        return { options: [] };
      });

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={mockSchema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onOptions: mockOnOptions,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Open country dropdown
    const countryButton = screen.getAllByRole('button', { name: /select an option/i })[0];
    await user.click(countryButton);

    // Select United Kingdom
    await waitFor(() => {
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    });
    await user.click(screen.getByText('United Kingdom'));

    // Open city dropdown
    const cityButtons = screen.getAllByRole('button');
    const cityButton = cityButtons.find(btn => btn.textContent?.includes('City'));
    expect(cityButton).toBeDefined();
    await user.click(cityButton!);

    // Verify UK cities are loaded
    await waitFor(() => {
      expect(screen.getByText('London')).toBeInTheDocument();
      expect(screen.getByText('Manchester')).toBeInTheDocument();
    });

    // Verify onOptions was called with dependent value
    expect(mockOnOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceName: 'cities',
        dependentValues: expect.objectContaining({
          country: 'uk',
        }),
      })
    );
  });

  it('handles multiselect with multiple selections', async () => {
    const mockOnOptions = vi.fn<OnOptionsCallback>().mockResolvedValue({
      options: [
        { value: 'javascript', label: 'JavaScript' },
        { value: 'typescript', label: 'TypeScript' },
        { value: 'python', label: 'Python' },
      ],
    });

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={mockSchema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onOptions: mockOnOptions,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Find and open tags multiselect
    const tagsButton = screen.getByRole('button', { name: /select options/i });
    await user.click(tagsButton);

    // Wait for options
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
    });

    // Select multiple options using checkboxes
    const jsCheckbox = screen.getByRole('checkbox', { name: /javascript/i });
    const tsCheckbox = screen.getByRole('checkbox', { name: /typescript/i });

    await user.click(jsCheckbox);
    await user.click(tsCheckbox);

    // Verify both are checked
    expect(jsCheckbox).toBeChecked();
    expect(tsCheckbox).toBeChecked();

    // Verify badges are displayed
    await waitFor(() => {
      expect(screen.getByText('JavaScript')).toBeInTheDocument();
      expect(screen.getByText('TypeScript')).toBeInTheDocument();
    });
  });

  it('handles pagination with nextPageToken', async () => {
    let page = 1;
    const mockOnOptions = vi.fn<OnOptionsCallback>()
      .mockImplementation(async ({ pageToken }: { pageToken?: string }) => {
        const currentPage = pageToken ? parseInt(pageToken) : 1;
        
        return {
          options: [
            { value: `item-${currentPage}-1`, label: `Item ${currentPage}-1` },
            { value: `item-${currentPage}-2`, label: `Item ${currentPage}-2` },
          ],
          nextPageToken: currentPage < 3 ? String(currentPage + 1) : undefined,
        };
      });

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={mockSchema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onOptions: mockOnOptions,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Open dropdown
    const countryButton = screen.getByRole('button', { name: /select an option/i });
    await user.click(countryButton);

    // Wait for first page
    await waitFor(() => {
      expect(screen.getByText('Item 1-1')).toBeInTheDocument();
    });

    // Scroll to bottom to trigger pagination
    const dropdown = screen.getByText('Item 1-1').closest('div[class*="overflow-y-auto"]');
    if (dropdown) {
      // Simulate scroll event
      dropdown.scrollTop = dropdown.scrollHeight;
      dropdown.dispatchEvent(new Event('scroll', { bubbles: true }));
    }

    // Wait for second page to load
    await waitFor(() => {
      expect(screen.getByText('Item 2-1')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('displays error message and retry button on failure', async () => {
    const mockOnOptions = vi.fn<OnOptionsCallback>().mockRejectedValue(
      new Error('Network error')
    );

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={mockSchema}
          callbacks={{ 
            onSubmit: vi.fn(),
            onOptions: mockOnOptions,
          }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Open dropdown
    const countryButton = screen.getByRole('button', { name: /select an option/i });
    await user.click(countryButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText(/failed to load options/i)).toBeInTheDocument();
    });

    // Verify retry button exists
    const retryButton = screen.getByRole('button', { name: /retry/i });
    expect(retryButton).toBeInTheDocument();

    // Click retry - mock will now succeed
    mockOnOptions.mockClear();
    mockOnOptions.mockResolvedValue({
      options: [{ value: 'uk', label: 'United Kingdom' }],
    });

    await user.click(retryButton);

    // Verify options load after retry
    await waitFor(() => {
      expect(screen.getByText('United Kingdom')).toBeInTheDocument();
    });
  });
});
