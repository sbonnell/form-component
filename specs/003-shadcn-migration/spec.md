# Feature Specification: shadcn Component Migration

**Feature Branch**: `003-shadcn-migration`  
**Created**: 2025-11-09  
**Status**: Draft  
**Input**: User description: "move all form components to use shadcn components. All work must be done in the /src folder and do not change the /app folder as this is for the reusable functionality only. Ensure any changes tailwind usage is also addresses"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Basic Input Fields Migration (Priority: P1)

A developer needs to use the form library with consistent, accessible input components that follow shadcn/ui design patterns for text fields, textareas, numbers, dates, and basic inputs.

**Why this priority**: Basic input fields are the foundation of any form. Without these working with shadcn components, no forms can function. This is the minimum viable migration that delivers immediate value.

**Independent Test**: Create a form with text, textarea, number, date, and time fields. Verify all fields render using shadcn Input and Textarea components with proper styling, validation states, and accessibility attributes. Submit form and confirm data capture works identically to current implementation.

**Acceptance Scenarios**:

1. **Given** a form schema with TextField, TextareaField, NumberField, DateField, and TimeField, **When** form renders, **Then** all fields use shadcn Input/Textarea components with consistent styling and proper ARIA labels
2. **Given** a field with validation errors, **When** validation triggers, **Then** field displays error state using shadcn error styling (red border, error text) and maintains accessibility
3. **Given** a disabled field, **When** form renders, **Then** field displays using shadcn disabled state styling (muted colors, cursor-not-allowed)
4. **Given** a required field, **When** form renders, **Then** field label shows required indicator and follows shadcn Label component patterns
5. **Given** a field with placeholder text, **When** field is empty, **Then** placeholder displays using shadcn Input placeholder styling

---

### User Story 2 - Select and Choice Components Migration (Priority: P1)

A developer needs dropdown selects, checkboxes, radio groups, toggles, and multi-selects to use shadcn components for consistent interaction patterns and accessibility.

**Why this priority**: Choice components are equally critical as inputs for form functionality. Radio groups, checkboxes, and selects are used in most forms and must migrate together with basic inputs for a complete MVP.

**Independent Test**: Create a form with SelectField (static and dynamic), CheckboxField, RadioField, ToggleField, and MultiSelectField. Verify all use appropriate shadcn components (Select, Checkbox, RadioGroup, Switch) with proper keyboard navigation and ARIA attributes. Confirm selection state management works identically.

**Acceptance Scenarios**:

1. **Given** a SelectField with static options, **When** user opens dropdown, **Then** options display using shadcn Select component with proper trigger button, content portal, and item styling
2. **Given** a SelectField with dynamic options and search, **When** user types in search box, **Then** options filter correctly and search input uses shadcn Input styling within Select component
3. **Given** a CheckboxField, **When** user clicks checkbox, **Then** checkbox uses shadcn Checkbox component with proper checked/unchecked states and focus ring
4. **Given** a RadioField with multiple options, **When** user selects option, **Then** radio group uses shadcn RadioGroup component with proper selection indicators and keyboard navigation
5. **Given** a ToggleField, **When** user clicks toggle, **Then** toggle uses shadcn Switch component with smooth transition animation
6. **Given** a MultiSelectField, **When** user selects multiple options, **Then** selected items display as shadcn Badges and dropdown uses Select component patterns

---

### User Story 3 - Specialized Field Components Migration (Priority: P2)

A developer needs specialized fields (currency, masked inputs, file uploads, date-time pickers, calculated fields) to work with shadcn components while maintaining their unique functionality.

**Why this priority**: These fields add advanced functionality but aren't required for basic forms. They can be migrated after core inputs and choices are working, allowing teams to start using the library sooner.

**Independent Test**: Create a form with CurrencyField, MaskedField (IBAN, phone), FileUploadField, DateTimeField, and CalculatedField. Verify each maintains its specialized behavior (formatting, validation, calculation) while using shadcn base components for consistent appearance.

**Acceptance Scenarios**:

1. **Given** a CurrencyField, **When** user types amount, **Then** field formats currency using shadcn Input with proper alignment and maintains existing currency validation
2. **Given** a MaskedField for IBAN, **When** user types characters, **Then** input formats with spaces using shadcn Input and validates format correctly
3. **Given** a FileUploadField, **When** user drags files, **Then** drop zone uses shadcn styling with hover states and progress bars use shadcn Progress component
4. **Given** a DateTimeField, **When** user clicks field, **Then** picker overlay uses shadcn Popover component with calendar styled consistently
5. **Given** a CalculatedField, **When** dependencies change, **Then** calculated value updates and displays in shadcn Input with readonly styling

---

### User Story 4 - Complex Field Types Migration (Priority: P3)

A developer needs array fields and object fields (nested structures) to render using shadcn components with proper visual hierarchy and interaction patterns.

**Why this priority**: Complex nested fields are less commonly used and more challenging to migrate. They can be addressed after all other field types work, as they represent edge cases in form design.

**Independent Test**: Create a form with ArrayField (add/remove items) and ObjectField (nested properties). Verify array controls use shadcn Button components, item containers use shadcn Card styling, and nested fields maintain proper visual hierarchy.

**Acceptance Scenarios**:

1. **Given** an ArrayField, **When** user clicks "Add Item", **Then** button uses shadcn Button component and new item appears in shadcn Card container
2. **Given** an ArrayField with items, **When** user clicks "Remove", **Then** remove button uses shadcn Button (destructive variant) and item removes with smooth transition
3. **Given** an ObjectField with nested properties, **When** form renders, **Then** nested fields appear in shadcn Card with proper spacing and visual grouping
4. **Given** an ArrayField with ObjectField items, **When** form renders, **Then** nested structure uses consistent shadcn component hierarchy (Card > nested Cards)

---

### User Story 5 - Layout Components Migration (Priority: P2)

A developer needs layout wrappers (FieldWrapper, WizardLayout, TabLayout) to use shadcn components for consistent spacing, typography, and visual hierarchy.

**Why this priority**: Layout components affect the overall form appearance and structure. Migrating these ensures consistent visual design across all forms but isn't blocking for individual field functionality.

**Independent Test**: Create forms using WizardLayout and TabLayout with various field types. Verify wizard steps use shadcn Card/Tabs components, navigation uses shadcn Button, and field wrappers use shadcn Label and form field patterns.

**Acceptance Scenarios**:

1. **Given** a FieldWrapper component, **When** rendering any field, **Then** label uses shadcn Label component, description uses shadcn muted text styling, and error messages use shadcn error text styling
2. **Given** a WizardLayout form, **When** user navigates steps, **Then** step indicators use shadcn styling, navigation buttons use shadcn Button (primary/secondary variants), and step content uses shadcn Card
3. **Given** a TabLayout form, **When** user switches tabs, **Then** tabs use shadcn Tabs component with proper trigger styling and content transitions
4. **Given** a multi-column field layout, **When** form renders, **Then** grid spacing follows shadcn spacing conventions and fields align properly

---

### Edge Cases

- What happens when shadcn component variants don't support existing field styling requirements? (e.g., custom input sizes, unique validation states)
- How does the migration handle custom Tailwind classes that conflict with shadcn component classes?
- What happens when shadcn Select component's portal behavior conflicts with modal/dialog containers?
- How are existing field accessibility attributes preserved when wrapping in shadcn components?
- What happens to existing Tailwind utility classes on field components when shadcn applies its own classes?
- How does FileUploadField's drag-and-drop styling integrate with shadcn component patterns?
- What happens when ArrayField/ObjectField nesting depth exceeds typical shadcn Card nesting patterns?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: All field components in `/src/components/fields/` MUST be refactored to use shadcn/ui base components (Input, Textarea, Select, Checkbox, RadioGroup, Switch, Button, Label)
- **FR-002**: All layout components in `/src/components/layout/` MUST use shadcn/ui components (Card, Tabs, Label, form field patterns)
- **FR-003**: All form components in `/src/components/form-component/` MUST update Tailwind class usage to align with shadcn styling conventions
- **FR-004**: Field validation states (error, success, disabled, readonly) MUST use shadcn component variant styling
- **FR-005**: Component accessibility (ARIA labels, roles, keyboard navigation) MUST be preserved or improved through shadcn component usage
- **FR-006**: All existing field functionality (data capture, validation, conditional logic, calculations) MUST work identically after migration
- **FR-007**: Component TypeScript types MUST be updated to reflect shadcn component prop types where applicable
- **FR-008**: No changes MUST be made to `/app` folder - all work confined to `/src` directory
- **FR-009**: Custom Tailwind utility classes MUST be reviewed and either kept (if compatible) or replaced with shadcn component variants
- **FR-010**: Field placeholder text, labels, descriptions, and error messages MUST render with shadcn typography styling
- **FR-011**: Dynamic option loading in SelectField MUST integrate with shadcn Select component's content portal
- **FR-012**: File upload progress indicators MUST use shadcn Progress component if available, or maintain custom styling if not
- **FR-013**: Wizard and tab navigation buttons MUST use shadcn Button component with appropriate variants (primary, secondary, destructive)
- **FR-014**: Form field spacing and grid layout MUST follow shadcn spacing conventions while maintaining 12-column grid functionality
- **FR-015**: All migrated components MUST maintain the same component API (props interface) to avoid breaking changes for consumers

### Assumptions

- shadcn/ui components are already installed and available in the project (based on README indicating shadcn/ui usage)
- Tailwind CSS configuration is already set up for shadcn components
- Existing form validation logic via React Hook Form and Zod will not change
- Component behavior and data flow remain unchanged - only visual presentation migrates to shadcn
- Dark mode support (if needed) will follow shadcn's theming approach
- Custom Tailwind utilities that don't conflict with shadcn can coexist
- Breaking changes to component props are not acceptable - must maintain backward compatibility

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 18 field components in `/src/components/fields/` successfully migrated to use shadcn base components with zero breaking changes to their public API
- **SC-002**: All layout components in `/src/components/layout/` use shadcn components for visual elements (labels, cards, spacing)
- **SC-003**: Form rendering performance remains within target (≤1.2 seconds for 75 fields) after shadcn migration
- **SC-004**: All WCAG 2.1 AA accessibility requirements continue to be met with shadcn components
- **SC-005**: Existing demo forms in `/app` folder render identically (same functionality, similar appearance) without any code changes to `/app` files
- **SC-006**: Bundle size remains within target (≤50KB gzipped for core components) after migration
- **SC-007**: All existing form validation and error display functionality works identically with shadcn error states
- **SC-008**: Keyboard navigation and focus management work seamlessly with shadcn component focus rings and states
- **SC-009**: All specialized field functionality (currency formatting, input masking, calculations, file uploads) continues working without regression
- **SC-010**: TypeScript compilation succeeds with zero errors after all component migrations
