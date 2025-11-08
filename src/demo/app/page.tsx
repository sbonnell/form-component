/**
 * Demo home page
 * 
 * Navigation to all example forms.
 */

import Link from 'next/link';

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
        
        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/examples/basic"
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
          </Link>
          
          <div className="p-6 bg-gray-100 rounded-lg shadow opacity-50">
            <h2 className="text-xl font-semibold text-gray-500 mb-2">
              Edit Mode 🚧
            </h2>
            <p className="text-gray-500">
              Form with pre-populated data and change tracking.
              Coming in Phase 4.
            </p>
          </div>
          
          <div className="p-6 bg-gray-100 rounded-lg shadow opacity-50">
            <h2 className="text-xl font-semibold text-gray-500 mb-2">
              Dynamic Options 🚧
            </h2>
            <p className="text-gray-500">
              Selects with remote data, search, and pagination.
              Coming in Phase 5.
            </p>
          </div>
          
          <div className="p-6 bg-gray-100 rounded-lg shadow opacity-50">
            <h2 className="text-xl font-semibold text-gray-500 mb-2">
              Conditional Logic 🚧
            </h2>
            <p className="text-gray-500">
              Dynamic field visibility and calculated fields.
              Coming in Phase 6.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
