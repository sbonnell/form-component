# Builder Page URL State Persistence

## Feature
The Form Builder page now saves and restores the state of the Component and Schema dropdowns using URL search parameters. This allows users to:
- Share builder links with specific schema and component selections
- Bookmark their preferred configurations
- Return to previous builder states

## Implementation

### URL Parameters
The builder page now uses two URL search parameters to persist state:

| Parameter | Values | Default | Purpose |
|-----------|--------|---------|---------|
| `schema` | Schema ID (e.g., `client-onboarding`) | `client-onboarding` | Selects which form schema to load |
| `component` | `schema`, `tabs`, `wizard` | `schema` | Selects which form component type to render |

### Example URLs

```
/builder
  → Default: SchemaForm with Client Onboarding schema

/builder?schema=employee-tabs&component=tabs
  → TabForm with Employee Tabs schema

/builder?schema=employee-wizard&component=wizard
  → WizardForm with Employee Wizard schema

/builder?schema=financial-data
  → SchemaForm with Financial Data schema
```

## Implementation Details

### Code Changes
**File:** `app/builder/page.tsx`

1. **Added useSearchParams import:**
   - Imported `useSearchParams` from `next/navigation` for URL parameter reading

2. **State initialization from URL:**
   - `selectedSchemaId` reads from `?schema=` parameter or defaults to `client-onboarding`
   - `selectedFormComponent` reads from `?component=` parameter or defaults to `schema`
   - Uses URL initializer functions for initial state

3. **URL update effect:**
   - Added `useEffect` hook that updates URL whenever selections change
   - Uses `window.history.replaceState()` to update URL without navigation
   - Only includes `?component=` parameter if not the default `schema`

4. **Suspense boundary:**
   - Wrapped builder content in `Suspense` boundary to handle dynamic `useSearchParams()`
   - Required by Next.js 16+ for client-side dynamic features

### Component Structure
```
FormBuilderPage (wrapper with Suspense)
  └─ FormBuilderContent (actual builder logic)
      └─ Uses useSearchParams() safely inside Suspense boundary
```

## User Experience

### Sharing Builder Links
Users can now share builder configurations:
1. Configure the builder (select schema and component type)
2. Copy the URL from the address bar
3. Share with colleagues who will see the exact same configuration

### Bookmarking Preferences
Users can bookmark their favorite configurations for quick access:
- `/builder?schema=employee-tabs&component=tabs` - Employee onboarding workflow
- `/builder?schema=trade-entry` - Trade entry form
- `/builder?schema=financial-data` - Financial data entry

### Browser History
The back/forward buttons work naturally:
- Users can navigate between different builder configurations
- Each configuration is tracked in browser history
- No page reloads, just URL and UI updates

## Technical Benefits

✅ **No Page Reloads** - Uses `replaceState()` for smooth updates
✅ **Bookmarkable** - Full application state in URL
✅ **Shareable** - Easy to share specific configurations
✅ **SEO Friendly** - Static page with dynamic parameters
✅ **Keyboard Shortcuts** - Browser back/forward buttons work
✅ **No Storage Needed** - State persisted in URL, not localStorage

## Browser Support
- All modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Next.js 13+ with App Router

## Future Enhancements
Potential improvements:
- Add `layout=50` parameter to save panel width percentage
- Add `highlightedField=fieldName` to save highlighted field
- Add `schema` data parameter to persist custom schema edits
