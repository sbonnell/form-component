# Schema-Driven Form Component - Complete Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Basic Schema Structure](#basic-schema-structure)
3. [Field Types](#field-types)
4. [Field Properties](#field-properties)
5. [UI Extensions](#ui-extensions)
6. [Validation Rules](#validation-rules)
7. [Conditional Logic](#conditional-logic)
8. [Dynamic Options](#dynamic-options)
9. [Calculations](#calculations)
10. [Layout Options](#layout-options)
11. [Complete Examples](#complete-examples)

---

## Introduction

The Schema-Driven Form Component renders create/edit forms from JSON Schema with custom UI extensions. It supports:

- ✅ 20+ field types (text, number, date, select, file upload, etc.)
- ✅ Validation with Zod integration
- ✅ Conditional logic (show/hide fields)
- ✅ Dynamic options (async data loading)
- ✅ Calculated fields
- ✅ Responsive grid layout
- ✅ Wizard and tab layouts
- ✅ shadcn/ui design system

---

## Basic Schema Structure

### Minimal Example

```json
{
  "type": "object",
  "title": "Contact Form",
  "description": "Please provide your contact information",
  "properties": {
    "fullName": {
      "type": "string",
      "title": "Full Name"
    },
    "email": {
      "type": "string",
      "title": "Email Address",
      "format": "email"
    }
  },
  "required": ["fullName", "email"]
}
```

### Schema Root Properties

| Property | Type | Description |
|----------|------|-------------|
| `type` | `"object"` | Must be "object" for form schemas |
| `title` | `string` | Form title (displayed at top) |
| `description` | `string` | Form description/instructions |
| `properties` | `object` | Field definitions (key-value pairs) |
| `required` | `string[]` | Array of required field names |
| `ui` | `object` | UI extensions (layout, submit button text, etc.) |

---

## Field Types

### Text Input

```json
{
  "fullName": {
    "type": "string",
    "title": "Full Name",
    "description": "Enter your legal full name",
    "minLength": 2,
    "maxLength": 100,
    "ui": {
      "placeholder": "John Smith"
    }
  }
}
```

### Textarea

```json
{
  "comments": {
    "type": "string",
    "title": "Comments",
    "ui": {
      "widget": "textarea",
      "placeholder": "Enter your comments here...",
      "rows": 5
    }
  }
}
```

### Number Input

```json
{
  "age": {
    "type": "number",
    "title": "Age",
    "minimum": 18,
    "maximum": 120,
    "ui": {
      "placeholder": "25"
    }
  }
}
```

### Date Picker

```json
{
  "birthDate": {
    "type": "string",
    "title": "Date of Birth",
    "format": "date",
    "ui": {
      "placeholder": "Pick a date"
    }
  }
}
```

### DateTime Picker

```json
{
  "appointmentTime": {
    "type": "string",
    "title": "Appointment Time",
    "format": "date-time",
    "ui": {
      "placeholder": "Select date and time"
    }
  }
}
```

### Time Input

```json
{
  "preferredTime": {
    "type": "string",
    "title": "Preferred Contact Time",
    "format": "time",
    "ui": {
      "placeholder": "09:00"
    }
  }
}
```

### Select Dropdown (Static)

```json
{
  "country": {
    "type": "string",
    "title": "Country",
    "enum": ["UK", "US", "CA", "AU"],
    "ui": {
      "enumNames": ["United Kingdom", "United States", "Canada", "Australia"],
      "placeholder": "Select a country"
    }
  }
}
```

### Select Dropdown (Dynamic)

```json
{
  "company": {
    "type": "string",
    "title": "Company",
    "ui": {
      "widget": "select",
      "optionsSource": "companies",
      "placeholder": "Search companies..."
    }
  }
}
```

**Note:** Requires `onOptions` callback to fetch data.

### Multi-Select

```json
{
  "skills": {
    "type": "array",
    "title": "Skills",
    "items": {
      "type": "string",
      "enum": ["JavaScript", "TypeScript", "React", "Node.js", "Python"]
    },
    "ui": {
      "widget": "multiselect",
      "placeholder": "Select your skills"
    }
  }
}
```

### Radio Buttons

```json
{
  "plan": {
    "type": "string",
    "title": "Subscription Plan",
    "enum": ["basic", "pro", "enterprise"],
    "ui": {
      "widget": "radio",
      "enumNames": ["Basic ($9/mo)", "Pro ($29/mo)", "Enterprise ($99/mo)"]
    }
  }
}
```

### Checkbox (Boolean)

```json
{
  "agreeToTerms": {
    "type": "boolean",
    "title": "I agree to the terms and conditions"
  }
}
```

### Toggle/Switch

```json
{
  "notifications": {
    "type": "boolean",
    "title": "Enable Notifications",
    "description": "Receive email notifications for updates",
    "ui": {
      "widget": "toggle"
    }
  }
}
```

### Currency Input

```json
{
  "salary": {
    "type": "number",
    "title": "Annual Salary",
    "ui": {
      "widget": "currency",
      "currency": "GBP"
    }
  }
}
```

**Supported currencies:** GBP, USD, EUR

### Masked Input

```json
{
  "iban": {
    "type": "string",
    "title": "IBAN",
    "ui": {
      "widget": "masked",
      "mask": "iban"
    }
  }
}
```

**Supported masks:**
- `iban` - GB00 ABCD 0123 4567 8901 23
- `ukPostcode` - SW1A 1AA
- `sortCode` - 12-34-56
- `phoneUK` - 07700 900000

### File Upload

```json
{
  "resume": {
    "type": "string",
    "title": "Resume",
    "format": "data-url",
    "ui": {
      "widget": "file",
      "accept": [".pdf", ".doc", ".docx"],
      "maxSizeMB": 5,
      "maxFiles": 1
    }
  }
}
```

### Calculated Field

```json
{
  "total": {
    "type": "number",
    "title": "Total Amount",
    "readOnly": true,
    "ui": {
      "widget": "calculated",
      "calculation": "quantity * price"
    }
  }
}
```

### Array Field (Repeater)

```json
{
  "phoneNumbers": {
    "type": "array",
    "title": "Phone Numbers",
    "items": {
      "type": "string",
      "title": "Phone",
      "ui": {
        "placeholder": "07700 900000"
      }
    },
    "minItems": 1,
    "maxItems": 5
  }
}
```

### Object Field (Nested)

```json
{
  "address": {
    "type": "object",
    "title": "Address",
    "properties": {
      "street": {
        "type": "string",
        "title": "Street"
      },
      "city": {
        "type": "string",
        "title": "City"
      },
      "postcode": {
        "type": "string",
        "title": "Postcode"
      }
    }
  }
}
```

---

## Field Properties

### Common Properties (All Fields)

```json
{
  "fieldName": {
    "type": "string",           // Field data type
    "title": "Field Label",     // Display label
    "description": "Help text", // Helper text below label
    "default": "value",         // Default value
    "readOnly": true,           // Make field read-only
    "ui": {
      "placeholder": "Enter value",
      "help": "Additional help text",
      "width": 6,               // Grid column span (1-12)
      "offset": 2               // Grid column offset (1-11)
    }
  }
}
```

### String Validation

```json
{
  "email": {
    "type": "string",
    "minLength": 5,
    "maxLength": 100,
    "pattern": "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$",
    "format": "email"  // Built-in formats: email, uri, date, time, date-time
  }
}
```

### Number Validation

```json
{
  "age": {
    "type": "number",
    "minimum": 0,
    "maximum": 150,
    "multipleOf": 1  // Integer values only
  }
}
```

### Array Validation

```json
{
  "tags": {
    "type": "array",
    "minItems": 1,
    "maxItems": 10,
    "uniqueItems": true
  }
}
```

---

## UI Extensions

### Grid Layout

Control field width and positioning using a 12-column grid:

```json
{
  "firstName": {
    "type": "string",
    "title": "First Name",
    "ui": {
      "width": 6  // Half width (50%)
    }
  },
  "lastName": {
    "type": "string",
    "title": "Last Name",
    "ui": {
      "width": 6  // Half width (50%)
    }
  },
  "email": {
    "type": "string",
    "title": "Email",
    "ui": {
      "width": 8,   // 66% width
      "offset": 2   // Skip 2 columns (16.67%)
    }
  }
}
```

**Width values:** 1-12 (1 = 8.33%, 12 = 100%)  
**Offset values:** 1-11

### Form-Level UI Options

```json
{
  "type": "object",
  "title": "Contact Form",
  "properties": { ... },
  "ui": {
    "submitButtonText": "Send Message",
    "layout": "default",  // "default" | "wizard" | "tabs"
    "columns": 12         // Grid columns (default: 12)
  }
}
```

---

## Validation Rules

### Required Fields

```json
{
  "type": "object",
  "properties": {
    "email": { "type": "string" },
    "name": { "type": "string" }
  },
  "required": ["email", "name"]
}
```

### Custom Error Messages (via Zod)

Use the Zod schema integration for custom messages:

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  age: z.number()
    .min(18, 'You must be at least 18 years old')
    .max(120, 'Please enter a valid age')
});
```

---

## Conditional Logic

### Show/Hide Fields Based on Values

```json
{
  "type": "object",
  "properties": {
    "hasCompany": {
      "type": "boolean",
      "title": "Do you have a company?"
    },
    "companyName": {
      "type": "string",
      "title": "Company Name"
    }
  },
  "ui": {
    "conditionalFields": {
      "companyName": {
        "showWhen": {
          "hasCompany": true
        }
      }
    }
  }
}
```

### Multiple Conditions

```json
{
  "ui": {
    "conditionalFields": {
      "internationalAddress": {
        "showWhen": {
          "country": ["US", "CA", "AU"],
          "isInternational": true
        }
      }
    }
  }
}
```

### Conditional Required Fields

```json
{
  "ui": {
    "conditionalFields": {
      "taxId": {
        "showWhen": {
          "businessType": "company"
        },
        "requiredWhen": {
          "businessType": "company"
        }
      }
    }
  }
}
```

---

## Dynamic Options

### Basic Dynamic Select

```json
{
  "company": {
    "type": "string",
    "title": "Company",
    "ui": {
      "widget": "select",
      "optionsSource": "companies",
      "placeholder": "Search companies..."
    }
  }
}
```

**Callback implementation:**

```typescript
const onOptions = async (request: OptionRequest): Promise<OptionResponse> => {
  const { source, searchQuery, pageToken } = request;
  
  if (source === 'companies') {
    const companies = await fetchCompanies(searchQuery, pageToken);
    return {
      options: companies.map(c => ({
        value: c.id,
        label: c.name
      })),
      hasMore: companies.hasNextPage,
      nextPageToken: companies.nextPageToken
    };
  }
  
  return { options: [] };
};
```

### Dependent Options

```json
{
  "country": {
    "type": "string",
    "title": "Country",
    "enum": ["UK", "US"]
  },
  "state": {
    "type": "string",
    "title": "State/Region",
    "ui": {
      "widget": "select",
      "optionsSource": "states",
      "dependsOn": ["country"]
    }
  }
}
```

**Callback with dependencies:**

```typescript
const onOptions = async (request: OptionRequest): Promise<OptionResponse> => {
  const { source, dependentValues } = request;
  
  if (source === 'states') {
    const country = dependentValues?.country;
    const states = await fetchStates(country);
    return {
      options: states.map(s => ({ value: s.code, label: s.name }))
    };
  }
  
  return { options: [] };
};
```

### Searchable Options

```json
{
  "customer": {
    "type": "string",
    "title": "Customer",
    "ui": {
      "widget": "select",
      "optionsSource": "customers",
      "searchable": true,
      "placeholder": "Type to search..."
    }
  }
}
```

---

## Calculations

### Simple Calculation

```json
{
  "properties": {
    "quantity": {
      "type": "number",
      "title": "Quantity"
    },
    "price": {
      "type": "number",
      "title": "Unit Price"
    },
    "total": {
      "type": "number",
      "title": "Total",
      "readOnly": true,
      "ui": {
        "widget": "calculated",
        "calculation": "quantity * price"
      }
    }
  }
}
```

### Calculation with Functions

```json
{
  "discount": {
    "type": "number",
    "title": "Discount (%)",
    "readOnly": true,
    "ui": {
      "widget": "calculated",
      "calculation": "total >= 1000 ? 10 : 5"
    }
  }
}
```

**Supported operators:**
- Arithmetic: `+`, `-`, `*`, `/`, `%`
- Comparison: `>`, `<`, `>=`, `<=`, `===`, `!==`
- Logical: `&&`, `||`, `!`
- Ternary: `condition ? value1 : value2`
- Functions: `Math.round()`, `Math.floor()`, `Math.ceil()`, `Math.abs()`

---

## Layout Options

### Default Layout

```json
{
  "type": "object",
  "title": "Registration Form",
  "ui": {
    "layout": "default"
  },
  "properties": { ... }
}
```

### Wizard Layout

```json
{
  "type": "object",
  "title": "Employee Onboarding",
  "ui": {
    "layout": "wizard",
    "wizard": {
      "steps": [
        {
          "id": "personal",
          "title": "Personal Information",
          "fields": ["firstName", "lastName", "email"]
        },
        {
          "id": "employment",
          "title": "Employment Details",
          "fields": ["department", "position", "startDate"]
        },
        {
          "id": "documents",
          "title": "Documents",
          "fields": ["resume", "idDocument"]
        }
      ]
    }
  },
  "properties": {
    "firstName": { "type": "string", "title": "First Name" },
    "lastName": { "type": "string", "title": "Last Name" },
    "email": { "type": "string", "title": "Email" },
    "department": { "type": "string", "title": "Department" },
    "position": { "type": "string", "title": "Position" },
    "startDate": { "type": "string", "format": "date", "title": "Start Date" },
    "resume": { "type": "string", "format": "data-url", "title": "Resume" },
    "idDocument": { "type": "string", "format": "data-url", "title": "ID Document" }
  }
}
```

### Tab Layout

```json
{
  "type": "object",
  "title": "Employee Profile",
  "ui": {
    "layout": "tabs",
    "tabs": {
      "sections": [
        {
          "id": "personal",
          "title": "Personal",
          "icon": "👤",
          "fields": ["firstName", "lastName", "email"]
        },
        {
          "id": "contact",
          "title": "Contact",
          "icon": "📞",
          "fields": ["phone", "address"]
        }
      ]
    }
  },
  "properties": { ... }
}
```

---

## Complete Examples

### Example 1: Client Onboarding Form

```json
{
  "type": "object",
  "title": "Client Onboarding",
  "description": "Please complete all fields to set up your account",
  "properties": {
    "personalInfo": {
      "type": "object",
      "title": "Personal Information",
      "properties": {
        "fullName": {
          "type": "string",
          "title": "Full Name",
          "minLength": 2,
          "ui": {
            "width": 6,
            "placeholder": "John Smith"
          }
        },
        "email": {
          "type": "string",
          "title": "Email Address",
          "format": "email",
          "ui": {
            "width": 6,
            "placeholder": "john@example.com"
          }
        },
        "phone": {
          "type": "string",
          "title": "Phone Number",
          "ui": {
            "width": 6,
            "widget": "masked",
            "mask": "phoneUK"
          }
        },
        "dateOfBirth": {
          "type": "string",
          "title": "Date of Birth",
          "format": "date",
          "ui": {
            "width": 6
          }
        }
      },
      "required": ["fullName", "email"]
    },
    "address": {
      "type": "object",
      "title": "Address",
      "properties": {
        "street": {
          "type": "string",
          "title": "Street Address",
          "ui": {
            "width": 12
          }
        },
        "city": {
          "type": "string",
          "title": "City",
          "ui": {
            "width": 6
          }
        },
        "postcode": {
          "type": "string",
          "title": "Postcode",
          "ui": {
            "width": 6,
            "widget": "masked",
            "mask": "ukPostcode"
          }
        }
      }
    },
    "accountType": {
      "type": "string",
      "title": "Account Type",
      "enum": ["personal", "business"],
      "ui": {
        "widget": "radio",
        "enumNames": ["Personal Account", "Business Account"],
        "width": 12
      }
    },
    "companyName": {
      "type": "string",
      "title": "Company Name",
      "ui": {
        "width": 12
      }
    },
    "agreeToTerms": {
      "type": "boolean",
      "title": "I agree to the terms and conditions"
    }
  },
  "required": ["personalInfo", "address", "accountType", "agreeToTerms"],
  "ui": {
    "submitButtonText": "Create Account",
    "conditionalFields": {
      "companyName": {
        "showWhen": {
          "accountType": "business"
        },
        "requiredWhen": {
          "accountType": "business"
        }
      }
    }
  }
}
```

### Example 2: Trade Entry Form with Calculations

```json
{
  "type": "object",
  "title": "Trade Entry",
  "properties": {
    "instrument": {
      "type": "string",
      "title": "Instrument",
      "ui": {
        "widget": "select",
        "optionsSource": "instruments",
        "searchable": true,
        "placeholder": "Search instruments...",
        "width": 6
      }
    },
    "side": {
      "type": "string",
      "title": "Side",
      "enum": ["buy", "sell"],
      "ui": {
        "widget": "radio",
        "enumNames": ["Buy", "Sell"],
        "width": 6
      }
    },
    "quantity": {
      "type": "number",
      "title": "Quantity",
      "minimum": 1,
      "ui": {
        "width": 4,
        "placeholder": "1000"
      }
    },
    "price": {
      "type": "number",
      "title": "Price",
      "minimum": 0.01,
      "ui": {
        "width": 4,
        "widget": "currency",
        "currency": "GBP"
      }
    },
    "commission": {
      "type": "number",
      "title": "Commission",
      "ui": {
        "width": 4,
        "widget": "currency",
        "currency": "GBP"
      }
    },
    "grossAmount": {
      "type": "number",
      "title": "Gross Amount",
      "readOnly": true,
      "ui": {
        "width": 6,
        "widget": "calculated",
        "calculation": "quantity * price"
      }
    },
    "netAmount": {
      "type": "number",
      "title": "Net Amount",
      "readOnly": true,
      "ui": {
        "width": 6,
        "widget": "calculated",
        "calculation": "(quantity * price) + commission"
      }
    },
    "tradeDate": {
      "type": "string",
      "title": "Trade Date",
      "format": "date",
      "ui": {
        "width": 6
      }
    },
    "settlementDate": {
      "type": "string",
      "title": "Settlement Date",
      "format": "date",
      "ui": {
        "width": 6
      }
    },
    "notes": {
      "type": "string",
      "title": "Notes",
      "ui": {
        "widget": "textarea",
        "rows": 4,
        "width": 12
      }
    }
  },
  "required": ["instrument", "side", "quantity", "price", "tradeDate"],
  "ui": {
    "submitButtonText": "Submit Trade"
  }
}
```

### Example 3: Document Upload Form

```json
{
  "type": "object",
  "title": "Document Upload",
  "description": "Upload required documents for verification",
  "properties": {
    "documentType": {
      "type": "string",
      "title": "Document Type",
      "enum": ["passport", "drivingLicense", "utilityBill"],
      "ui": {
        "widget": "select",
        "enumNames": ["Passport", "Driving License", "Utility Bill"],
        "placeholder": "Select document type",
        "width": 12
      }
    },
    "documentFile": {
      "type": "string",
      "title": "Upload Document",
      "format": "data-url",
      "ui": {
        "widget": "file",
        "accept": [".pdf", ".jpg", ".jpeg", ".png"],
        "maxSizeMB": 10,
        "maxFiles": 1,
        "width": 12
      }
    },
    "documentNumber": {
      "type": "string",
      "title": "Document Number",
      "ui": {
        "width": 6,
        "placeholder": "e.g., AB123456"
      }
    },
    "expiryDate": {
      "type": "string",
      "title": "Expiry Date",
      "format": "date",
      "ui": {
        "width": 6
      }
    },
    "additionalNotes": {
      "type": "string",
      "title": "Additional Notes",
      "ui": {
        "widget": "textarea",
        "rows": 3,
        "width": 12,
        "placeholder": "Optional notes about the document..."
      }
    }
  },
  "required": ["documentType", "documentFile", "documentNumber"],
  "ui": {
    "submitButtonText": "Upload Document"
  }
}
```

### Example 4: Employee Wizard Form

```json
{
  "type": "object",
  "title": "Employee Onboarding",
  "ui": {
    "layout": "wizard",
    "wizard": {
      "steps": [
        {
          "id": "personal",
          "title": "Personal Details",
          "description": "Basic personal information",
          "fields": ["firstName", "lastName", "email", "phone", "dateOfBirth"]
        },
        {
          "id": "employment",
          "title": "Employment",
          "description": "Job and department information",
          "fields": ["department", "position", "startDate", "employmentType"]
        },
        {
          "id": "compensation",
          "title": "Compensation",
          "description": "Salary and benefits",
          "fields": ["salary", "currency", "paymentFrequency"]
        },
        {
          "id": "documents",
          "title": "Documents",
          "description": "Upload required documents",
          "fields": ["resume", "idDocument", "bankDetails"]
        }
      ]
    }
  },
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First Name",
      "ui": { "width": 6 }
    },
    "lastName": {
      "type": "string",
      "title": "Last Name",
      "ui": { "width": 6 }
    },
    "email": {
      "type": "string",
      "title": "Email",
      "format": "email",
      "ui": { "width": 6 }
    },
    "phone": {
      "type": "string",
      "title": "Phone",
      "ui": { 
        "width": 6,
        "widget": "masked",
        "mask": "phoneUK"
      }
    },
    "dateOfBirth": {
      "type": "string",
      "title": "Date of Birth",
      "format": "date"
    },
    "department": {
      "type": "string",
      "title": "Department",
      "ui": {
        "widget": "select",
        "optionsSource": "departments"
      }
    },
    "position": {
      "type": "string",
      "title": "Position",
      "ui": {
        "widget": "select",
        "optionsSource": "positions",
        "dependsOn": ["department"]
      }
    },
    "startDate": {
      "type": "string",
      "title": "Start Date",
      "format": "date"
    },
    "employmentType": {
      "type": "string",
      "title": "Employment Type",
      "enum": ["fullTime", "partTime", "contract"],
      "ui": {
        "enumNames": ["Full Time", "Part Time", "Contract"]
      }
    },
    "salary": {
      "type": "number",
      "title": "Annual Salary",
      "ui": {
        "widget": "currency",
        "currency": "GBP"
      }
    },
    "currency": {
      "type": "string",
      "title": "Currency",
      "enum": ["GBP", "USD", "EUR"],
      "default": "GBP"
    },
    "paymentFrequency": {
      "type": "string",
      "title": "Payment Frequency",
      "enum": ["monthly", "weekly", "biweekly"],
      "ui": {
        "enumNames": ["Monthly", "Weekly", "Bi-weekly"]
      }
    },
    "resume": {
      "type": "string",
      "title": "Resume/CV",
      "format": "data-url",
      "ui": {
        "widget": "file",
        "accept": [".pdf", ".doc", ".docx"],
        "maxSizeMB": 5
      }
    },
    "idDocument": {
      "type": "string",
      "title": "ID Document",
      "format": "data-url",
      "ui": {
        "widget": "file",
        "accept": [".pdf", ".jpg", ".png"],
        "maxSizeMB": 5
      }
    },
    "bankDetails": {
      "type": "string",
      "title": "Bank Details",
      "format": "data-url",
      "ui": {
        "widget": "file",
        "accept": [".pdf"],
        "maxSizeMB": 2
      }
    }
  },
  "required": [
    "firstName", 
    "lastName", 
    "email", 
    "department", 
    "position", 
    "startDate", 
    "employmentType"
  ]
}
```

---

## Usage in React

### Basic Usage

```typescript
import { SchemaForm } from '@/components/form-component';
import type { FormSchema } from '@/types/schema';

const schema: FormSchema = {
  type: 'object',
  title: 'Contact Form',
  properties: {
    name: {
      type: 'string',
      title: 'Name'
    },
    email: {
      type: 'string',
      title: 'Email',
      format: 'email'
    }
  },
  required: ['name', 'email']
};

function MyForm() {
  const handleSubmit = async (data: any) => {
    console.log('Form data:', data);
    // Submit to API
  };

  return (
    <SchemaForm
      schema={schema}
      callbacks={{ onSubmit: handleSubmit }}
    />
  );
}
```

### With Dynamic Options

```typescript
import { SchemaForm } from '@/components/form-component';
import type { OptionRequest, OptionResponse } from '@/types/callbacks';

const handleOptions = async (request: OptionRequest): Promise<OptionResponse> => {
  const { source, searchQuery, dependentValues } = request;
  
  if (source === 'companies') {
    const response = await fetch(`/api/companies?q=${searchQuery}`);
    const data = await response.json();
    
    return {
      options: data.map((company: any) => ({
        value: company.id,
        label: company.name
      }))
    };
  }
  
  return { options: [] };
};

function MyForm() {
  return (
    <SchemaForm
      schema={schema}
      callbacks={{
        onSubmit: handleSubmit,
        onOptions: handleOptions
      }}
    />
  );
}
```

### With Wizard Layout

```typescript
import { WizardForm } from '@/components/form-component';

function MyWizardForm() {
  return (
    <WizardForm
      schema={wizardSchema}
      callbacks={{
        onSubmit: handleSubmit,
        onOptions: handleOptions
      }}
    />
  );
}
```

### With Tab Layout

```typescript
import { TabForm } from '@/components/form-component';

function MyTabForm() {
  return (
    <TabForm
      schema={tabSchema}
      callbacks={{
        onSubmit: handleSubmit,
        onOptions: handleOptions
      }}
    />
  );
}
```

### With Edit Mode (Pre-filled Data)

```typescript
function EditForm({ existingData }: { existingData: any }) {
  return (
    <SchemaForm
      schema={schema}
      initialData={existingData}
      callbacks={{
        onSubmit: handleUpdate
      }}
      context={{
        formMode: 'edit',
        userId: currentUser.id
      }}
    />
  );
}
```

---

## API Reference

### SchemaForm Props

```typescript
interface SchemaFormProps {
  schema: FormSchema;           // JSON Schema definition
  initialData?: any;            // Pre-fill form data (for edit mode)
  callbacks: {
    onSubmit: OnSubmitCallback;
    onOptions?: OnOptionsCallback;
    onUpload?: OnUploadCallback;
  };
  context?: CallbackContext;    // Additional context (userId, locale, etc.)
}
```

### Callback Types

```typescript
type OnSubmitCallback = (
  data: any, 
  context: CallbackContext
) => Promise<void>;

type OnOptionsCallback = (
  request: OptionRequest, 
  context: CallbackContext
) => Promise<OptionResponse>;

type OnUploadCallback = (
  file: File,
  fieldKey: string,
  context: CallbackContext
) => Promise<UploadedFile>;
```

---

## Best Practices

### 1. Use Meaningful Field Names

✅ Good:
```json
{
  "firstName": { "type": "string", "title": "First Name" },
  "email": { "type": "string", "title": "Email" }
}
```

❌ Bad:
```json
{
  "field1": { "type": "string", "title": "First Name" },
  "txt2": { "type": "string", "title": "Email" }
}
```

### 2. Provide Clear Labels and Descriptions

```json
{
  "iban": {
    "type": "string",
    "title": "IBAN",
    "description": "Your International Bank Account Number",
    "ui": {
      "placeholder": "GB00 ABCD 0123 4567 8901 23",
      "help": "You can find this on your bank statement"
    }
  }
}
```

### 3. Use Appropriate Field Types

- Use `format: "email"` for email addresses
- Use `format: "date"` for dates
- Use `widget: "currency"` for money values
- Use `widget: "masked"` for formatted inputs (IBAN, phone, etc.)

### 4. Set Sensible Validation Rules

```json
{
  "age": {
    "type": "number",
    "title": "Age",
    "minimum": 18,
    "maximum": 120,
    "ui": {
      "placeholder": "25"
    }
  }
}
```

### 5. Use Grid Layout for Better UX

```json
{
  "firstName": { "ui": { "width": 6 } },
  "lastName": { "ui": { "width": 6 } },
  "email": { "ui": { "width": 12 } }
}
```

### 6. Implement Conditional Logic

Show/hide fields based on user selections:

```json
{
  "ui": {
    "conditionalFields": {
      "internationalPhone": {
        "showWhen": {
          "country": ["US", "CA", "AU"]
        }
      }
    }
  }
}
```

### 7. Use Wizard for Multi-Step Forms

Break complex forms into logical steps:

```json
{
  "ui": {
    "layout": "wizard",
    "wizard": {
      "steps": [
        { "id": "personal", "title": "Personal", "fields": [...] },
        { "id": "company", "title": "Company", "fields": [...] },
        { "id": "review", "title": "Review", "fields": [...] }
      ]
    }
  }
}
```

---

## Troubleshooting

### Field Not Rendering

**Problem:** Field doesn't appear in the form.

**Solutions:**
1. Check field is in `properties` object
2. Verify field name doesn't contain special characters
3. Check conditional logic isn't hiding it
4. Ensure field type is supported

### Validation Not Working

**Problem:** Form submits despite invalid data.

**Solutions:**
1. Add field to `required` array for required fields
2. Check validation rules (minLength, maximum, pattern, etc.)
3. Verify format is correct (email, date, etc.)
4. Use browser DevTools to see validation errors

### Dynamic Options Not Loading

**Problem:** Select dropdown is empty.

**Solutions:**
1. Verify `onOptions` callback is provided
2. Check `optionsSource` matches callback source
3. Ensure callback returns correct format: `{ options: [...] }`
4. Check browser console for errors

### Calculations Not Updating

**Problem:** Calculated field shows wrong value.

**Solutions:**
1. Check calculation syntax
2. Verify field names in calculation exist
3. Ensure `widget: "calculated"` is set
4. Check field is `readOnly: true`

---

## Additional Resources

- [Component API Documentation](./API.md)
- [Validation Guide](./VALIDATION.md)
- [Styling Guide](./STYLING.md)
- [Examples Repository](../app/examples/)

---

## Support

For questions or issues:
- Check the [examples](../app/examples/) folder for working code
- Review the [builder page](http://localhost:3000/builder) for live examples
- Consult the TypeScript types in `src/types/schema.ts`
