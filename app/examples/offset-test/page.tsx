'use client';

import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { SchemaForm } from '@/components/form-component';
import { queryClient } from '@/lib/options/cache';
import type { FormSchema } from '@/types/schema';
import type { CallbackContext, OnSubmitResponse } from '@/types/callbacks';

const offsetTestSchema: FormSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  meta: {
    id: 'offset-test',
    version: '1.0.0',
    title: 'Grid Offset Test',
    mode: 'create',
    description: 'Testing offset functionality with different field widths',
  },
  type: 'object',
  properties: {
    fullWidthField: {
      type: 'string',
      title: 'Full Width (No Offset)',
      ui: {
        width: 12,
        placeholder: 'This field spans 12 columns',
      },
    },
    halfWidthLeft: {
      type: 'string',
      title: 'Half Width - Left (Width 6, No Offset)',
      ui: {
        width: 6,
        placeholder: 'Width: 6, Offset: 0',
      },
    },
    halfWidthRight: {
      type: 'string',
      title: 'Half Width - Right (Width 6, No Offset)',
      ui: {
        width: 6,
        placeholder: 'Width: 6, Offset: 0',
      },
    },
    offsetTest1: {
      type: 'string',
      title: 'Width 6, Offset 3 (Centered)',
      description: 'This should be centered (skip 3 columns, use 6 columns, skip 3 columns)',
      ui: {
        width: 6,
        offset: 3,
        placeholder: 'Width: 6, Offset: 3',
      },
    },
    offsetTest2: {
      type: 'string',
      title: 'Width 4, Offset 2',
      description: 'This should start at column 3 (skip 2 columns, use 4 columns)',
      ui: {
        width: 4,
        offset: 2,
        placeholder: 'Width: 4, Offset: 2',
      },
    },
    offsetTest3: {
      type: 'string',
      title: 'Width 6, Offset 6 (Right Aligned)',
      description: 'This should be on the right side (skip 6 columns, use 6 columns)',
      ui: {
        width: 6,
        offset: 6,
        placeholder: 'Width: 6, Offset: 6',
      },
    },
    smallOffset1: {
      type: 'string',
      title: 'Width 3, Offset 1',
      ui: {
        width: 3,
        offset: 1,
        placeholder: 'W:3, O:1',
      },
    },
    smallOffset2: {
      type: 'string',
      title: 'Width 3, Offset 2',
      ui: {
        width: 3,
        offset: 2,
        placeholder: 'W:3, O:2',
      },
    },
    threeFields1: {
      type: 'string',
      title: 'Field 1 (Width 4)',
      ui: {
        width: 4,
        placeholder: 'Width: 4',
      },
    },
    threeFields2: {
      type: 'string',
      title: 'Field 2 (Width 4)',
      ui: {
        width: 4,
        placeholder: 'Width: 4',
      },
    },
    threeFields3: {
      type: 'string',
      title: 'Field 3 (Width 4)',
      ui: {
        width: 4,
        placeholder: 'Width: 4',
      },
    },
    offsetLarge: {
      type: 'string',
      title: 'Width 3, Offset 9 (Far Right)',
      description: 'This should be at the far right',
      ui: {
        width: 3,
        offset: 9,
        placeholder: 'W:3, O:9',
      },
    },
  },
  required: [],
};

export default function OffsetTestPage() {
  const context = React.useMemo<CallbackContext>(() => ({
    userId: 'demo-user',
    locale: 'en-GB',
    correlationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    formMode: 'create',
    sessionId: 'demo-session',
  }), []);

  const handleSubmit = async (data: any): Promise<OnSubmitResponse> => {
    console.log('Form submitted:', data);
    alert('Form submitted! Check console for data.');
    return {
      ok: true,
      message: 'Form submitted successfully!',
    };
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8 p-6 bg-muted rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Offset Testing Guide</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This page tests the grid offset functionality. The grid uses 12 columns.
          Offset specifies how many columns to skip before the field starts.
        </p>
        <div className="space-y-2 text-sm">
          <p><strong>Examples:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4 text-muted-foreground">
            <li><code>width: 6, offset: 3</code> → Skip 3 columns, use 6 columns (centered)</li>
            <li><code>width: 6, offset: 6</code> → Skip 6 columns, use 6 columns (right aligned)</li>
            <li><code>width: 4, offset: 2</code> → Skip 2 columns, use 4 columns</li>
          </ul>
        </div>
      </div>

      <SchemaForm
        schema={offsetTestSchema}
        callbacks={{
          onSubmit: handleSubmit,
        }}
        context={context}
      />

      <div className="mt-8 p-6 bg-muted rounded-lg">
        <h3 className="text-md font-semibold mb-2">Grid Visualization</h3>
        <p className="text-sm text-muted-foreground mb-4">
          The form above uses a 12-column grid. Resize your browser window to see responsive behavior:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-4 text-sm text-muted-foreground">
          <li><strong>Mobile:</strong> Fields stack vertically (1 column)</li>
          <li><strong>Medium (448px+):</strong> 6-column grid</li>
          <li><strong>Large (576px+):</strong> 6-column grid</li>
          <li><strong>XL (672px+):</strong> 12-column grid (offsets fully apply here)</li>
        </ul>
      </div>
    </div>
    </QueryClientProvider>
  );
}
