/**
 * Conditional logic integration test
 * 
 * Tests hiddenWhen, requiredWhen conditional rules and calculated fields.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClientProvider } from '@tanstack/react-query';
import { SchemaForm } from '@/components/form-component';
import { queryClient } from '@/lib/options/cache';
import type { FormSchema } from '@/types/schema';
import type { CallbackContext } from '@/types/callbacks';

const mockContext: CallbackContext = {
  userId: 'test-user',
  locale: 'en-GB',
  correlationId: 'test-correlation-id',
  timestamp: new Date().toISOString(),
  formMode: 'create',
};

describe('Conditional Logic', () => {
  it('hides field when hiddenWhen condition is true', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'conditional-form',
        version: '1.0.0',
        title: 'Conditional Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        hasOtherIncome: {
          type: 'boolean',
          title: 'Do you have other income?',
          ui: { widget: 'checkbox' },
        },
        otherIncomeAmount: {
          type: 'number',
          title: 'Other Income Amount',
          ui: {
            hiddenWhen: {
              field: 'hasOtherIncome',
              operator: 'equals',
              value: false,
            },
          },
        },
      },
    };

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ onSubmit: vi.fn() }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Field should be hidden initially (hasOtherIncome is false/unchecked)
    expect(screen.queryByLabelText(/other income amount/i)).not.toBeInTheDocument();

    // Check the checkbox
    const checkbox = screen.getByLabelText(/do you have other income/i);
    await user.click(checkbox);

    // Field should now be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/other income amount/i)).toBeInTheDocument();
    });

    // Uncheck the checkbox
    await user.click(checkbox);

    // Field should be hidden again
    await waitFor(() => {
      expect(screen.queryByLabelText(/other income amount/i)).not.toBeInTheDocument();
    });
  });

  it('makes field required when requiredWhen condition is true', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'conditional-required-form',
        version: '1.0.0',
        title: 'Conditional Required Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        employmentStatus: {
          type: 'string',
          title: 'Employment Status',
          enum: ['employed', 'self-employed', 'unemployed'],
        },
        employerName: {
          type: 'string',
          title: 'Employer Name',
          ui: {
            requiredWhen: {
              field: 'employmentStatus',
              operator: 'equals',
              value: 'employed',
            },
          },
        },
      },
      required: ['employmentStatus'],
    };

    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ onSubmit: mockOnSubmit }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Select 'employed' - should make employerName required
    const statusSelect = screen.getAllByRole('combobox')[0] || screen.getAllByRole('button')[0];
    await user.click(statusSelect);
    
    await waitFor(() => {
      const employedOption = screen.getByText('employed');
      expect(employedOption).toBeInTheDocument();
    });
    
    await user.click(screen.getByText('employed'));

    // Try to submit without filling employer name
    const submitButton = screen.getByRole('button', { name: /submit/i });
    await user.click(submitButton);

    // Should show validation error for required field
    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });

    // Should not have called onSubmit
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('evaluates complex AND conditions', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'complex-conditional-form',
        version: '1.0.0',
        title: 'Complex Conditional Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        age: {
          type: 'number',
          title: 'Age',
        },
        hasLicense: {
          type: 'boolean',
          title: 'Has Drivers License',
          ui: { widget: 'checkbox' },
        },
        vehicleType: {
          type: 'string',
          title: 'Vehicle Type',
          enum: ['car', 'motorcycle', 'truck'],
          ui: {
            hiddenWhen: {
              and: [
                {
                  field: 'age',
                  operator: 'greaterThanOrEqual',
                  value: 18,
                },
                {
                  field: 'hasLicense',
                  operator: 'equals',
                  value: true,
                },
              ],
            },
          },
        },
      },
    };

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ onSubmit: vi.fn() }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Initially field should be visible (conditions not met)
    await waitFor(() => {
      expect(screen.getByLabelText(/vehicle type/i)).toBeInTheDocument();
    });

    // Enter age >= 18
    const ageInput = screen.getByLabelText(/age/i);
    await user.type(ageInput, '25');

    // Still visible (only 1 of 2 conditions met)
    expect(screen.getByLabelText(/vehicle type/i)).toBeInTheDocument();

    // Check license checkbox
    const licenseCheckbox = screen.getByLabelText(/has drivers license/i);
    await user.click(licenseCheckbox);

    // Now field should be hidden (both AND conditions met)
    await waitFor(() => {
      expect(screen.queryByLabelText(/vehicle type/i)).not.toBeInTheDocument();
    });
  });

  it('evaluates complex OR conditions', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'or-conditional-form',
        version: '1.0.0',
        title: 'OR Conditional Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        contactMethod: {
          type: 'string',
          title: 'Preferred Contact Method',
          enum: ['email', 'phone', 'sms'],
        },
        contactDetails: {
          type: 'string',
          title: 'Contact Details',
          ui: {
            hiddenWhen: {
              or: [
                {
                  field: 'contactMethod',
                  operator: 'equals',
                  value: 'email',
                },
                {
                  field: 'contactMethod',
                  operator: 'equals',
                  value: 'phone',
                },
              ],
            },
          },
        },
      },
    };

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ onSubmit: vi.fn() }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Field should be visible initially (no value selected)
    await waitFor(() => {
      expect(screen.getByLabelText(/contact details/i)).toBeInTheDocument();
    });

    // Select 'email' - should hide field (OR condition 1 met)
    const methodSelect = screen.getByLabelText(/preferred contact method/i);
    await user.selectOptions(methodSelect, 'email');

    // Field should be hidden
    await waitFor(() => {
      expect(screen.queryByLabelText(/contact details/i)).not.toBeInTheDocument();
    });
  });

  it('updates calculated fields when dependencies change', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'calculated-form',
        version: '1.0.0',
        title: 'Calculated Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          title: 'Quantity',
        },
        pricePerUnit: {
          type: 'number',
          title: 'Price Per Unit',
        },
        totalPrice: {
          type: 'number',
          title: 'Total Price',
          readOnly: true,
          ui: {
            widget: 'calculated',
          },
        },
      },
      logic: {
        calculated: [
          {
            target: 'totalPrice',
            dependsOn: ['quantity', 'pricePerUnit'],
            formula: 'quantity * pricePerUnit',
          },
        ],
      },
    };

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ onSubmit: vi.fn() }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // Enter quantity
    const quantityInput = screen.getByLabelText(/quantity/i);
    await user.type(quantityInput, '5');

    // Enter price per unit
    const priceInput = screen.getByLabelText(/price per unit/i);
    await user.type(priceInput, '10');

    // Calculated field should update
    await waitFor(() => {
      const totalField = screen.getByText('50');
      expect(totalField).toBeInTheDocument();
    });

    // Change quantity
    await user.clear(quantityInput);
    await user.type(quantityInput, '3');

    // Total should recalculate
    await waitFor(() => {
      const totalField = screen.getByText('30');
      expect(totalField).toBeInTheDocument();
    });
  });

  it('handles nested field paths in conditions', async () => {
    const schema: FormSchema = {
      $schema: 'https://json-schema.org/draft/2020-12/schema',
      meta: {
        id: 'nested-conditional-form',
        version: '1.0.0',
        title: 'Nested Conditional Form',
        mode: 'create',
      },
      type: 'object',
      properties: {
        address: {
          type: 'object',
          title: 'Address',
          properties: {
            country: {
              type: 'string',
              title: 'Country',
              enum: ['US', 'UK', 'CA'],
            },
            state: {
              type: 'string',
              title: 'State/Province',
              ui: {
                hiddenWhen: {
                  field: 'address.country',
                  operator: 'notEquals',
                  value: 'US',
                },
              },
            },
          },
        },
      },
    };

    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <SchemaForm
          schema={schema}
          callbacks={{ onSubmit: vi.fn() }}
          context={mockContext}
        />
      </QueryClientProvider>
    );

    // State field should be hidden initially
    await waitFor(() => {
      expect(screen.queryByLabelText(/state\/province/i)).not.toBeInTheDocument();
    });

    // Expand address section if collapsible
    const addressHeading = screen.queryByText(/address/i);
    if (addressHeading) {
      const expandButton = addressHeading.closest('button');
      if (expandButton) {
        await user.click(expandButton);
      }
    }

    // Select US for country
    const countrySelects = screen.getAllByRole('combobox');
    const countrySelect = countrySelects.find(select => 
      select.closest('label')?.textContent?.includes('Country')
    );
    
    if (countrySelect) {
      await user.click(countrySelect);
      
      await waitFor(() => {
        const usOption = screen.getByText('US');
        expect(usOption).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('US'));

      // State field should now be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/state\/province/i)).toBeInTheDocument();
      });
    }
  });
});
