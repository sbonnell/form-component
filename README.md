# Schema-Driven Form Component

> **Production-ready form component that renders create/edit forms from JSON Schema with advanced features**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0+-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2+-61dafb.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)

**Built with**: Next.js 16 • React 19 • TypeScript 5.3 • React Hook Form 7 • Zod 3 • Tailwind CSS 3

---

## ✨ Features

- 📝 **Schema-Driven**: Define forms with JSON Schema (2020-12) + UI extensions
- 🎨 **15+ Field Types**: Text, number, select, file upload, masked input, currency, datetime, and more
- ✅ **Validation**: Real-time validation with Zod schemas and custom rules
- 🔄 **Conditional Logic**: Dynamic show/hide fields, conditional requirements, calculated values
- 🌐 **Dynamic Options**: Remote data sources with search, pagination, and caching
- 📤 **File Uploads**: Multi-file uploads with drag-and-drop, type/size validation, progress tracking
- 🧭 **Wizard Layouts**: Multi-step forms with progress tracking and per-step validation
- 🎯 **Accessibility**: WCAG 2.1 AA compliant with full keyboard navigation
- ⚡ **Performance**: <50KB gzipped, supports 100+ fields without blocking
- 🔧 **TypeScript**: Fully typed with strict mode enabled

---

## 📦 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/sbonnell/form-component.git
cd form-component

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the demo.

### Build for Production

```bash
npm run build
npm run start
```

---

## 🚀 Usage

### Basic Form Example

```tsx
import SchemaForm from '@/components/form-component/SchemaForm';
import type { FormSchema, FormCallbacks, CallbackContext } from '@/types/schema';

const schema: FormSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "meta": {
    "id": "contact-form",
    "version": "1.0.0",
    "title": "Contact Form",
    "mode": "create"
  },
  "type": "object",
  "required": ["name", "email"],
  "properties": {
    "name": {
      "type": "string",
      "title": "Full Name",
      "minLength": 2,
      "maxLength": 100
    },
    "email": {
      "type": "string",
      "title": "Email Address",
      "format": "email"
    },
    "message": {
      "type": "string",
      "title": "Message",
      "ui": { "widget": "textarea" }
    }
  }
};

export default function ContactPage() {
  const callbacks: FormCallbacks = {
    onSubmit: async ({ rawData }) => {
      const response = await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(rawData),
      });
      
      if (response.ok) {
        return { ok: true, message: 'Message sent successfully!' };
      }
      return { ok: false, message: 'Failed to send message' };
    },
  };

  const context: CallbackContext = {
    userId: 'current-user-id',
    locale: 'en-GB',
    correlationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    formMode: 'create',
  };

  return <SchemaForm schema={schema} callbacks={callbacks} context={context} />;
}
```

### Advanced Features

#### Field Layout & Positioning

Control field width and positioning using the 12-column grid system:

```json
{
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First Name",
      "ui": {
        "width": 6  // Half width (6/12 columns)
      }
    },
    "lastName": {
      "type": "string",
      "title": "Last Name",
      "ui": {
        "width": 6  // Half width - appears side-by-side
      }
    },
    "totalAmount": {
      "type": "number",
      "title": "Total",
      "ui": {
        "width": 6,
        "offset": 6  // Skip 6 columns, align to the right
      }
    }
  }
}
```

**Layout Properties:**
- `width`: Column span (1-12) - controls field width
- `offset`: Column offset (1-11) - number of columns to skip before field starts

**Common Patterns:**
- Side-by-side fields: Two fields with `width: 6`
- Three-column layout: Three fields with `width: 4`
- Right-aligned field: `width: 6, offset: 6`
- Centered field: `width: 6, offset: 3`

#### Conditional Fields

```json
{
  "properties": {
    "employmentStatus": {
      "type": "string",
      "title": "Employment Status",
      "enum": ["employed", "self-employed", "unemployed"]
    },
    "companyName": {
      "type": "string",
      "title": "Company Name",
      "ui": {
        "hiddenWhen": {
          "field": "employmentStatus",
          "operator": "notIn",
          "value": ["employed", "self-employed"]
        }
      }
    }
  }
}
```

#### Dynamic Options with Search

```json
{
  "properties": {
    "country": {
      "type": "string",
      "title": "Country",
      "ui": {
        "widget": "select",
        "optionsSource": "countries"
      }
    }
  },
  "dataSources": {
    "options": [{ "name": "countries" }]
  }
}
```

```tsx
const callbacks: FormCallbacks = {
  onOptions: async ({ sourceName, searchTerm, page }) => {
    const response = await fetch(
      `/api/options/${sourceName}?search=${searchTerm}&page=${page}`
    );
    const data = await response.json();
    return {
      options: data.options,
      hasMore: data.hasMore,
      total: data.total,
    };
  },
  // ... other callbacks
};
```

#### Masked Input Fields

```json
{
  "properties": {
    "iban": {
      "type": "string",
      "title": "IBAN",
      "ui": {
        "widget": "masked",
        "mask": "iban",
        "placeholder": "GB82 WEST 1234 5698 7654 32"
      }
    },
    "salary": {
      "type": "number",
      "title": "Annual Salary",
      "ui": {
        "widget": "currency",
        "currency": "GBP",
        "decimalScale": 2
      }
    }
  }
}
```

#### Wizard Layout

```json
{
  "meta": {
    "layout": "wizard"
  },
  "wizard": {
    "steps": [
      {
        "id": "personal",
        "title": "Personal Information",
        "description": "Basic details",
        "fields": ["firstName", "lastName", "email"]
      },
      {
        "id": "address",
        "title": "Address",
        "description": "Contact information",
        "fields": ["street", "city", "postcode"],
        "allowIncomplete": true
      }
    ]
  }
}
```

---

## 📚 Documentation

- **[Feature Specification](./specs/001-schema-driven-form/spec.md)** - Complete functional requirements
- **[Implementation Plan](./specs/001-schema-driven-form/plan.md)** - Technical architecture and approach
- **[Task Breakdown](./specs/001-schema-driven-form/tasks.md)** - Development tasks and progress
- **[Data Model](./specs/001-schema-driven-form/data-model.md)** - Schema structure and entities
- **[Quickstart Guide](./specs/001-schema-driven-form/quickstart.md)** - Integration examples

---

## 🎯 Live Examples

The demo site includes working examples of all features:

- **[Basic Form](http://localhost:3000/examples/basic)** - Simple form with validation
- **[Edit Mode](http://localhost:3000/examples/edit)** - Pre-populated form with change tracking
- **[Dynamic Options](http://localhost:3000/examples/dynamic)** - Remote data with search
- **[Conditional Logic](http://localhost:3000/examples/conditional)** - Dynamic visibility and calculations
- **[File Upload](http://localhost:3000/examples/file-upload)** - Multi-file uploads with validation
- **[Wizard](http://localhost:3000/examples/wizard)** - Multi-step form with progress tracking
- **[Financial Data](http://localhost:3000/examples/financial-data)** - Masked inputs and currency fields

---

## 🏗️ Project Structure

```
form-component/
├── src/
│   ├── components/
│   │   ├── form-component/      # Core form components
│   │   │   ├── SchemaForm.tsx   # Main form orchestrator
│   │   │   ├── WizardForm.tsx   # Multi-step wizard
│   │   │   └── TabForm.tsx      # Tabbed layout
│   │   ├── fields/              # Field components
│   │   │   ├── TextField.tsx
│   │   │   ├── SelectField.tsx
│   │   │   ├── MaskedField.tsx
│   │   │   ├── CurrencyField.tsx
│   │   │   └── ... (15+ field types)
│   │   └── layout/              # Layout components
│   ├── lib/
│   │   ├── schema/              # Schema parsing & validation
│   │   ├── conditional-logic/   # Conditional rules engine
│   │   ├── calculations/        # Formula evaluator
│   │   ├── formatting/          # Input masks & formatters
│   │   └── options/             # Dynamic options fetcher
│   ├── hooks/                   # React hooks
│   │   ├── useFormState.ts
│   │   ├── useValidation.ts
│   │   └── useConditionalLogic.ts
│   ├── types/                   # TypeScript definitions
│   └── demo/                    # Demo schemas
├── app/                         # Next.js app router
│   └── examples/                # Live examples
├── specs/                       # Specification & planning
└── tests/                       # Test suites

```

---

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16.0.1 (with Turbopack) |
| **UI Library** | React 19.2.0 |
| **Language** | TypeScript 5.3+ (strict mode) |
| **Forms** | React Hook Form 7.51.0 |
| **Validation** | Zod 3.23.0 |
| **Styling** | Tailwind CSS 3.4.0 |
| **Components** | shadcn/ui |
| **State** | TanStack Query 5.x (for options caching) |
| **Testing** | Vitest, React Testing Library, Playwright |

---

## 📋 Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher (or yarn/pnpm equivalent)
- **TypeScript**: 5.3.0 or higher
- **Modern Browser**: Chrome/Edge 120+, Firefox 121+, Safari 17+

---

## 🚦 Performance

- ⚡ **Bundle Size**: Core component <50KB gzipped
- 🏃 **Render Time**: ≤1.2s for 75 fields
- ⚙️ **Interaction**: ≤100ms response time
- 📡 **Submit**: ≤2.0s round-trip (network dependent)
- 🔢 **Field Support**: Up to 100 fields without UI blocking

---

## ♿ Accessibility

- ✅ WCAG 2.1 AA compliant
- ⌨️ Full keyboard navigation
- 🎯 Proper ARIA labels and roles
- 🔍 Screen reader tested
- 🎨 High contrast mode support
- 📱 Responsive design (desktop-first)

---

## 📝 License

MIT License - see [LICENSE](./LICENSE) for details

---

## 🤝 Contributing

This is a private internal project. For questions or support, contact the development team.

---

## 🔗 Links

- **Repository**: https://github.com/sbonnell/form-component
- **Issues**: https://github.com/sbonnell/form-component/issues
- **Documentation**: [./specs/001-schema-driven-form/](./specs/001-schema-driven-form/)

---

**Built with ❤️ for internal use at [Your Organization]**
