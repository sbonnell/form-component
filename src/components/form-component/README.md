# Form Components Architecture

## Self-Contained Form Components

All form components are **fully self-contained** with built-in validation, form state management, and providers. Parent pages only need to provide the schema and callbacks.

### 1. SchemaForm (Basic Grid Layout)

**Purpose:** Standard form with fields in a responsive grid layout

**Usage:**
```tsx
<SchemaForm
  schema={schema}
  callbacks={{ onSubmit: handleSubmit }}
  context={context}
  initialData={data} // optional for edit mode
/>
```

**Built-in Features:**
- ✅ Zod validation via `useFormState` hook
- ✅ FormProvider and RHFFormProvider wrappers
- ✅ Conditional logic support
- ✅ Calculated fields support
- ✅ File upload support
- ✅ Edit mode with `onLoad` callback
- ✅ Submit/Reset buttons
- ✅ Loading states
- ✅ Error handling

**Layout:** 12-column responsive grid

---

### 2. WizardForm (Step-by-Step Layout)

**Purpose:** Multi-step wizard with validation gates between steps

**Usage:**
```tsx
<WizardForm
  schema={schema} // must have schema.layout.wizard.steps
  callbacks={{ onSubmit: handleSubmit }}
  context={context}
/>
```

**Built-in Features:**
- ✅ Zod validation via `useFormState` hook
- ✅ FormProvider and RHFFormProvider wrappers
- ✅ Auto-renders fields from `schema.layout.wizard.steps`
- ✅ Per-step validation gates (configurable via `allowIncomplete`)
- ✅ Step progress indicators
- ✅ Error tracking per step
- ✅ Previous/Next/Complete navigation
- ✅ Complete button disabled until all steps valid
- ✅ Conditional logic support
- ✅ Calculated fields support

**Layout:** Reads step definitions from `schema.layout.wizard.steps`

**Schema Requirements:**
```json
{
  "layout": {
    "wizard": {
      "steps": [
        {
          "id": "personal",
          "title": "Personal Info",
          "description": "Basic details",
          "fields": ["firstName", "lastName", "email"],
          "allowIncomplete": false  // Default: must validate before Next
        },
        {
          "id": "optional",
          "title": "Optional Details",
          "description": "Can skip if needed",
          "fields": ["phone", "address"],
          "allowIncomplete": true   // Can navigate away even if invalid
        }
      ]
    }
  }
}
```

**Validation Behavior:**
- Steps with `allowIncomplete: false` (default): Must pass validation before clicking Next
- Steps with `allowIncomplete: true`: Can navigate to other steps even with errors
- Complete button: **Always disabled** until ALL steps are valid, regardless of `allowIncomplete` settings
- Use Case: Allow users to fill critical sections first, then return to optional sections later

---

### 3. TabForm (Tab Navigation Layout)

**Purpose:** Form with tab-based section navigation and error indicators

**Usage:**
```tsx
<TabForm
  schema={schema} // must have schema.layout.tabs
  callbacks={{ onSubmit: handleSubmit }}
  context={context}
/>
```

**Built-in Features:**
- ✅ Zod validation via `useFormState` hook
- ✅ FormProvider and RHFFormProvider wrappers
- ✅ Auto-renders fields from `schema.layout.tabs`
- ✅ Error indicators on tab headers
- ✅ Submit/Reset buttons
- ✅ Conditional logic support
- ✅ Calculated fields support

**Layout:** Reads tab definitions from `schema.layout.tabs`

**Schema Requirements:**
```json
{
  "layout": {
    "tabs": [
      {
        "id": "contact",
        "title": "Contact Info",
        "icon": "📧",
        "fields": ["email", "phone"]
      }
    ]
  }
}
```

---

## Presentational Layout Components

These are **pure presentational components** that don't manage form state. They're used internally by form components or can be used standalone.

### GridLayout

Renders fields in a 12-column responsive grid.

```tsx
<GridLayout
  rows={[
    {
      fields: [
        { element: <TextField .../>, width: 6 },
        { element: <TextField .../>, width: 6 }
      ]
    }
  ]}
/>
```

### TabLayout

Renders tab navigation with content sections.

```tsx
<TabLayout
  tabs={tabSections}
  errors={formState.errors}
/>
```

### WizardLayout

Renders step indicators and navigation buttons.

```tsx
<WizardLayout
  steps={wizardSteps}
  errors={formState.errors}
  validateFields={validateFields}
  formData={getValues()}
/>
```

### FieldGroup

Semantic fieldset wrapper for grouping fields.

```tsx
<FieldGroup
  title="Contact Information"
  description="How we reach you"
  collapsible={true}
>
  {children}
</FieldGroup>
```

---

## Key Design Principles

1. **Minimal Parent Dependencies** - Parent pages only provide schema and callbacks
2. **Built-in Validation** - All form components use `useFormState` with zodResolver
3. **Built-in Providers** - All form components wrap with FormProvider and RHFFormProvider
4. **Auto-render Fields** - Form components read schema and render appropriate field types
5. **Layout Separation** - Layout components are presentational, form components are stateful

---

## Migration from Manual Setup

**Before (Manual Setup):**
```tsx
const validationSchema = schemaToZod(schema.properties, schema.required);
const form = useForm({ resolver: zodResolver(validationSchema) });

<FormProvider value={formContextValue}>
  <RHFFormProvider {...form}>
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Manually render fields */}
      <TextField ... />
      <SelectField ... />
    </form>
  </RHFFormProvider>
</FormProvider>
```

**After (Self-Contained):**
```tsx
<WizardForm
  schema={schema}
  callbacks={{ onSubmit: handleSubmit }}
  context={context}
/>
```

**Lines of Code:** ~400 → ~10 (97% reduction!)
