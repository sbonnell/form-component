# Quickstart Guide: Schema-Driven Form Component V1

**Feature**: 001-schema-driven-form  
**Date**: 2025-11-08  
**Audience**: Developers integrating the form component

## Overview

This guide walks you through integrating the Schema-Driven Form Component into your Next.js application in 15 minutes.

---

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Next.js 14+ application
- TypeScript 5.3+
- Tailwind CSS 3.x configured

---

## Installation

```bash
# Install the form component package (example - replace with actual package name)
npm install @your-org/schema-form

# Install peer dependencies
npm install react-hook-form zod @hookform/resolvers @tanstack/react-query

# Install shadcn/ui components (if not already installed)
npx shadcn-ui@latest init
npx shadcn-ui@latest add form input select label tabs button
```

---

## Quick Example: Basic Client Form

### 1. Create a Form Schema

Create `schemas/client-onboarding.json`:

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "meta": {
    "id": "client-onboarding",
    "version": "1.0.0",
    "title": "Client Onboarding",
    "mode": "create"
  },
  "type": "object",
  "required": ["clientName", "country", "contactEmail"],
  "properties": {
    "clientName": {
      "type": "string",
      "title": "Client Name",
      "minLength": 2,
      "maxLength": 100
    },
    "country": {
      "type": "string",
      "title": "Country",
      "ui": {
        "widget": "select",
        "optionsSource": "countries"
      }
    },
    "contactEmail": {
      "type": "string",
      "title": "Email Address",
      "format": "email"
    },
    "contactPhone": {
      "type": "string",
      "title": "Phone Number",
      "ui": {
        "widget": "masked",
        "mask": "+{44} 00 0000 0000"
      }
    }
  },
  "dataSources": {
    "options": [
      { "name": "countries" }
    ]
  },
  "layout": {
    "grid": [
      {
        "row": [
          { "field": "clientName", "width": 12 }
        ]
      },
      {
        "row": [
          { "field": "country", "width": 6 },
          { "field": "contactEmail", "width": 6 }
        ]
      },
      {
        "row": [
          { "field": "contactPhone", "width": 6 }
        ]
      }
    ]
  }
}
```

### 2. Implement Callbacks

Create `lib/form-callbacks.ts`:

```typescript
import type { 
  OnOptionsCallback, 
  OnSubmitCallback,
  CallbackContext 
} from '@your-org/schema-form';

// Mock country options (replace with real API call)
export const onOptions: OnOptionsCallback = async ({ name, query }) => {
  if (name === 'countries') {
    const countries = [
      { value: 'GB', label: 'United Kingdom' },
      { value: 'US', label: 'United States' },
      { value: 'FR', label: 'France' },
      { value: 'DE', label: 'Germany' },
    ];
    
    // Filter by search query
    const filtered = query 
      ? countries.filter(c => c.label.toLowerCase().includes(query.toLowerCase()))
      : countries;
    
    return { options: filtered };
  }
  
  return { options: [] };
};

// Handle form submission
export const onSubmit: OnSubmitCallback = async ({ rawData, changedFields, schemaMeta, context }) => {
  try {
    // Replace with your API endpoint
    const response = await fetch('/api/clients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-ID': context.correlationId,
      },
      body: JSON.stringify({
        ...rawData,
        userId: context.userId,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      return {
        ok: false,
        message: error.message || 'Failed to create client',
        fieldErrors: error.fieldErrors,
      };
    }
    
    const data = await response.json();
    return {
      ok: true,
      id: data.id,
      message: 'Client created successfully',
    };
  } catch (error) {
    return {
      ok: false,
      message: 'Network error - please try again',
    };
  }
};

// Generate callback context
export function createCallbackContext(userId: string): CallbackContext {
  return {
    userId,
    locale: 'en-GB',
    correlationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    formMode: 'create',
  };
}
```

### 3. Create Form Page

Create `app/clients/new/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { SchemaForm } from '@your-org/schema-form';
import { useRouter } from 'next/navigation';
import { onOptions, onSubmit, createCallbackContext } from '@/lib/form-callbacks';
import schema from '@/schemas/client-onboarding.json';

export default function NewClientPage() {
  const router = useRouter();
  const [context] = useState(() => createCallbackContext('current-user-id'));
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">New Client Onboarding</h1>
      
      <SchemaForm
        schema={schema}
        callbacks={{
          onOptions,
          onSubmit,
          onAfterSubmit: async ({ result }) => {
            if (result.ok) {
              // Show success toast (using your preferred toast library)
              console.log('Success:', result.message);
              
              // Redirect to client list
              router.push('/clients');
            }
          },
        }}
        context={context}
      />
    </div>
  );
}
```

### 4. Run Your Application

```bash
npm run dev
```

Navigate to `http://localhost:3000/clients/new` to see your form!

---

## Edit Mode Example

For editing existing records, provide initial data:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { SchemaForm } from '@your-org/schema-form';
import schema from '@/schemas/client-onboarding.json';

export default function EditClientPage({ params }: { params: { id: string } }) {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch existing client data
    fetch(`/api/clients/${params.id}`)
      .then(res => res.json())
      .then(data => {
        setInitialData(data);
        setLoading(false);
      });
  }, [params.id]);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Edit Client</h1>
      
      <SchemaForm
        schema={{
          ...schema,
          meta: { ...schema.meta, mode: 'edit' }
        }}
        initialData={initialData}
        callbacks={{
          onOptions,
          onSubmit: async ({ rawData, changedFields, context }) => {
            // Only send changed fields to API
            const updates = Object.keys(changedFields)
              .filter(key => changedFields[key])
              .reduce((acc, key) => ({ ...acc, [key]: rawData[key] }), {});
            
            const response = await fetch(`/api/clients/${params.id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updates),
            });
            
            if (!response.ok) {
              return { ok: false, message: 'Update failed' };
            }
            
            return { ok: true, message: 'Client updated successfully' };
          },
        }}
        context={createCallbackContext('current-user-id')}
      />
    </div>
  );
}
```

---

## Advanced Features

### Conditional Fields

Show/hide fields based on other field values:

```json
{
  "properties": {
    "hasFees": {
      "type": "boolean",
      "title": "Include Fees?",
      "ui": { "widget": "toggle" }
    },
    "feeAmount": {
      "type": "number",
      "title": "Fee Amount",
      "ui": {
        "widget": "currency",
        "currency": "GBP",
        "hiddenWhen": { "field": "hasFees", "equals": false }
      }
    }
  }
}
```

### Calculated Fields

Compute field values from other fields:

```json
{
  "properties": {
    "grossAmount": {
      "type": "number",
      "title": "Gross Amount",
      "ui": { "widget": "currency", "currency": "GBP" }
    },
    "discount": {
      "type": "number",
      "title": "Discount %",
      "minimum": 0,
      "maximum": 100
    },
    "netAmount": {
      "type": "number",
      "title": "Net Amount",
      "readOnly": true,
      "ui": { "widget": "calculated" }
    }
  },
  "logic": {
    "calculated": [
      {
        "target": "netAmount",
        "dependsOn": ["grossAmount", "discount"],
        "formula": "(values.grossAmount || 0) * (1 - (values.discount || 0) / 100)"
      }
    ]
  }
}
```

### File Uploads

```json
{
  "properties": {
    "documents": {
      "type": "array",
      "title": "Supporting Documents",
      "items": { "type": "string" },
      "ui": {
        "widget": "file",
        "upload": {
          "callback": "uploadDocs",
          "maxFiles": 5,
          "maxSizeMB": 10,
          "accept": ["application/pdf", "text/csv"]
        }
      }
    }
  }
}
```

Implement the upload callback:

```typescript
export const onUpload: OnUploadCallback = async ({ fieldKey, files, context }) => {
  const uploadedFiles = await Promise.all(
    files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file.data);
      formData.append('correlationId', context.correlationId);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      return {
        fileId: data.id,
        url: data.url,
        name: file.name,
        size: file.size,
        mimeType: file.type,
        checksum: data.checksum,
      };
    })
  );
  
  return { files: uploadedFiles };
};
```

### Tabs Layout

Organize large forms into tabs:

```json
{
  "layout": {
    "tabs": [
      {
        "title": "Basic Info",
        "fields": ["clientName", "country", "contactEmail"]
      },
      {
        "title": "Additional Details",
        "fields": ["contactPhone", "notes"]
      },
      {
        "title": "Documents",
        "fields": ["documents"]
      }
    ]
  }
}
```

### Wizard/Stepper Layout

Multi-step forms with validation gates:

```json
{
  "layout": {
    "wizard": {
      "steps": [
        {
          "title": "Client Information",
          "description": "Basic client details",
          "fields": ["clientName", "country"]
        },
        {
          "title": "Contact Details",
          "description": "How to reach the client",
          "fields": ["contactEmail", "contactPhone"]
        },
        {
          "title": "Review & Submit",
          "description": "Review all information",
          "fields": []
        }
      ]
    }
  }
}
```

---

## Component Props Reference

```typescript
interface SchemaFormProps {
  /** Form schema definition */
  schema: FormSchema;
  
  /** Callback functions */
  callbacks: FormCallbacks;
  
  /** Callback context */
  context: CallbackContext;
  
  /** Initial form data (for edit mode) */
  initialData?: Record<string, any>;
  
  /** Custom class name */
  className?: string;
  
  /** Whether to show debug info (development only) */
  debug?: boolean;
}
```

---

## Validation Messages

Default validation messages can be customized in the schema:

```json
{
  "ui": {
    "messages": {
      "globalError": "Please review the highlighted fields before submitting.",
      "submitText": "Create Client",
      "resetText": "Clear Form"
    }
  }
}
```

---

## Performance Tips

1. **Code Splitting**: Import the form component dynamically for faster initial page load:

```typescript
import dynamic from 'next/dynamic';

const SchemaForm = dynamic(() => import('@your-org/schema-form').then(mod => mod.SchemaForm), {
  ssr: false, // Form component is client-only
  loading: () => <div>Loading form...</div>,
});
```

2. **Memoize Callbacks**: Wrap callbacks in `useCallback` to prevent unnecessary re-renders:

```typescript
const callbacks = useMemo(() => ({
  onOptions,
  onSubmit,
  onAfterSubmit,
}), []);
```

3. **Large Option Lists**: Use pagination in your `onOptions` callback:

```typescript
export const onOptions: OnOptionsCallback = async ({ name, query, pageToken }) => {
  const pageSize = 50;
  const offset = pageToken ? parseInt(pageToken) : 0;
  
  const response = await fetch(
    `/api/options/${name}?query=${query}&offset=${offset}&limit=${pageSize}`
  );
  const data = await response.json();
  
  return {
    options: data.items,
    nextPageToken: data.hasMore ? String(offset + pageSize) : undefined,
  };
};
```

---

## Debugging

Enable debug mode during development:

```typescript
<SchemaForm
  schema={schema}
  callbacks={callbacks}
  context={context}
  debug={process.env.NODE_ENV === 'development'}
/>
```

This will log:
- Schema parsing results
- Validation errors
- Conditional rule evaluations
- Callback invocations

---

## Testing Your Form

Example test with React Testing Library:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SchemaForm } from '@your-org/schema-form';
import schema from './test-schema.json';

test('submits form with valid data', async () => {
  const onSubmit = jest.fn().mockResolvedValue({ ok: true });
  const user = userEvent.setup();
  
  render(
    <SchemaForm
      schema={schema}
      callbacks={{ onSubmit }}
      context={createTestContext()}
    />
  );
  
  // Fill in form
  await user.type(screen.getByLabelText('Client Name'), 'Acme Corp');
  await user.selectOptions(screen.getByLabelText('Country'), 'GB');
  await user.type(screen.getByLabelText('Email'), 'contact@acme.com');
  
  // Submit
  await user.click(screen.getByRole('button', { name: /submit/i }));
  
  // Verify submission
  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        rawData: expect.objectContaining({
          clientName: 'Acme Corp',
          country: 'GB',
          contactEmail: 'contact@acme.com',
        }),
      })
    );
  });
});
```

---

## Next Steps

- **Schema Authoring Guide**: Learn advanced schema patterns
- **Callback Best Practices**: Error handling, retry logic, loading states
- **Accessibility Guide**: WCAG compliance and keyboard navigation
- **Migration Guide**: Upgrading from custom forms to schema-driven forms

For questions or issues, contact the App Platform team or check the component documentation.
