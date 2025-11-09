/**
 * Demo home page
 * 
 * Navigation to all example forms.
 */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Schema-Driven Form Component
          </h1>
          <p className="text-lg text-gray-600">
            Interactive demos showcasing form capabilities
          </p>
        </div>
        
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg">
          <h2 className="text-lg font-bold text-blue-900 mb-2">🛠 Form Builder</h2>
          <p className="text-blue-800 mb-4">
            Interactive tool to test forms with live schema editing, responsive design testing with resizable panels, and form component selection.
          </p>
          <a
            href="/builder"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Open Form Builder →
          </a>
        </div>

        <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg">
          <h2 className="text-lg font-bold text-green-900 mb-2">💾 CRUD Demo</h2>
          <p className="text-green-800 mb-4">
            Full-stack CRUD operations with SQLite database, Drizzle ORM, and schema-driven forms. Create, read, update, and delete records across three tables.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="/demo/crud/users"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Users →
            </a>
            <a
              href="/demo/crud/transactions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Transactions →
            </a>
            <a
              href="/demo/crud/goods"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Goods →
            </a>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <a
            href="/examples/basic"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Basic Form (MVP) ✅
            </h2>
            <p className="text-gray-600">
              Simple form with text, number, date, select, and checkbox fields.
              Demonstrates validation and submission.
            </p>
            <p className="text-sm text-blue-600 mt-4">View Example →</p>
          </a>
          
          <a
            href="/examples/edit"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Edit Mode ✅
            </h2>
            <p className="text-gray-600">
              Form with pre-populated data and change tracking.
              Demonstrates onLoad callback and dirty field detection.
            </p>
            <p className="text-sm text-blue-600 mt-4">View Example →</p>
          </a>
          
          <a
            href="/examples/dynamic"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Dynamic Options ✅
            </h2>
            <p className="text-gray-600">
              Selects with remote data, search, pagination, and field dependencies.
              Demonstrates onOptions callback and TanStack Query caching.
            </p>
            <p className="text-sm text-blue-600 mt-4">View Example →</p>
          </a>
          
          <a
            href="/examples/conditional"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Conditional Logic ✅
            </h2>
            <p className="text-gray-600">
              Dynamic field visibility, conditional required fields, and calculated totals.
              Demonstrates hiddenWhen, requiredWhen, and formula evaluation.
            </p>
            <p className="text-sm text-blue-600 mt-4">View Example →</p>
          </a>
          
          <a
            href="/examples/file-upload"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              File Upload ✅
            </h2>
            <p className="text-gray-600">
              File uploads with drag-and-drop, validation (type, size, count), and progress tracking.
              Demonstrates onUpload callback and client-side file validation.
            </p>
            <p className="text-sm text-blue-600 mt-4">View Example →</p>
          </a>
          
          <a
            href="/examples/wizard"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Wizard Layout ✅
            </h2>
            <p className="text-gray-600">
              Multi-step wizard with progress tracking, per-step validation, and error indicators.
              Demonstrates wizard layout for complex multi-page forms.
            </p>
            <p className="text-sm text-blue-600 mt-4">View Example →</p>
          </a>

          <a
            href="/examples/tabs"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Tabs Layout ✅
            </h2>
            <p className="text-gray-600">
              Multi-section tabbed form with validation indicators and icon support.
              Demonstrates tabbed layout for organized multi-section forms.
            </p>
            <p className="text-sm text-blue-600 mt-4">View Example →</p>
          </a>

          <a
            href="/examples/financial-data"
            target="_blank"
            rel="noopener noreferrer"
            className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Masked & Formatted Inputs ✅
            </h2>
            <p className="text-gray-600">
              Masked input fields (IBAN, postcode, phone), currency formatting, radio/toggle fields.
              Demonstrates automatic input formatting and validation.
            </p>
            <p className="text-sm text-blue-600 mt-4">View Example →</p>
          </a>
        </div>
      </div>
    </div>
  );
}
