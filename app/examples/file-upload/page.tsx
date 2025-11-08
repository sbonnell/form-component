'use client';

/**
 * File Upload Demo Page
 * 
 * Demonstrates file upload functionality with:
 * - Multiple file constraints (type, size, count)
 * - Drag-and-drop interface
 * - Upload progress tracking
 * - Client-side validation
 */

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import SchemaForm from '@/components/form-component/SchemaForm';
import schema from '@/demo/schemas/document-upload.json';
import type { FormSchema } from '@/types/schema';
import type { FormCallbacks, CallbackContext } from '@/types/callbacks';

const queryClient = new QueryClient();

export default function FileUploadDemoPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <FileUploadDemo />
    </QueryClientProvider>
  );
}

function FileUploadDemo() {
  const [submittedData, setSubmittedData] = useState<any>(null);

  const context: CallbackContext = {
    userId: 'demo-user',
    locale: 'en-GB',
    correlationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    formMode: 'create',
  };

  const callbacks: FormCallbacks = {
    onUpload: async ({ fieldKey, files, context }) => {
      console.log('📤 Upload called for field:', fieldKey);
      console.log('Files to upload:', files);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Simulate successful upload - return mock file metadata
      return {
        files: files.map((file, index) => ({
          fileId: `file-${Date.now()}-${index}`,
          url: `https://example.com/files/${file.name}`,
          name: file.name,
          size: file.size,
          mimeType: file.type,
          checksum: `sha256-${Math.random().toString(36).substring(7)}`,
        })),
      };
    },

    onSubmit: async ({ rawData, changedFields, schemaMeta, context }) => {
      console.log('📝 Form submitted:', rawData);
      console.log('Changed fields:', changedFields);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      setSubmittedData(rawData);

      return {
        ok: true,
        message: 'Documents uploaded successfully!',
        id: 'submission-' + Date.now(),
      };
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          File Upload Demo
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Demonstrates file upload fields with client-side validation, drag-and-drop support, and progress tracking.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-blue-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">File Validation</h3>
          <p className="text-sm text-gray-600">
            Client-side validation for file type, size, and count before upload
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-green-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Drag & Drop</h3>
          <p className="text-sm text-gray-600">
            Drag files directly onto upload zones or click to browse
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-purple-600 mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Progress Tracking</h3>
          <p className="text-sm text-gray-600">
            Real-time upload progress with retry and cancel options
          </p>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Try These Interactions
        </h3>
        <ul className="space-y-2 text-sm text-blue-900">
          <li className="flex items-start">
            <span className="font-semibold mr-2">1.</span>
            <span>Try uploading a file that violates constraints (e.g., wrong type or too large) - see client-side validation</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">2.</span>
            <span>Drag files directly onto the upload zones instead of clicking</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">3.</span>
            <span>Upload valid files and watch the progress indicator</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">4.</span>
            <span>Remove uploaded files using the ✕ button</span>
          </li>
          <li className="flex items-start">
            <span className="font-semibold mr-2">5.</span>
            <span>Submit the form to see all file metadata in the submitted data</span>
          </li>
        </ul>
      </div>

      {/* Form */}
      <div className="mb-8">
        <SchemaForm
          schema={schema as unknown as FormSchema}
          callbacks={callbacks}
          context={context}
        />
      </div>

      {/* Technical Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Technical Implementation</h3>
        
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-semibold text-gray-700 mb-2">File Field Schema</h4>
            <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto">
{`"singlePDF": {
  "type": "array",
  "title": "Single PDF Document",
  "items": { "type": "object" },
  "ui": {
    "widget": "file",
    "upload": {
      "maxFiles": 1,
      "maxSizeMB": 5,
      "accept": [".pdf", "application/pdf"]
    }
  }
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">onUpload Callback</h4>
            <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto">
{`const callbacks = {
  onUpload: async ({ fieldKey, files, context }) => {
    // Handle file upload to your server
    const response = await uploadToServer(files);
    
    // Return file metadata
    return {
      files: response.files.map(file => ({
        fileId: file.id,
        url: file.url,
        name: file.name,
        size: file.size,
        mimeType: file.mimeType,
        checksum: file.checksum
      }))
    };
  }
};`}
            </pre>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Validation Rules</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li><strong>maxFiles:</strong> Maximum number of files allowed</li>
              <li><strong>maxSizeMB:</strong> Maximum size per file in megabytes</li>
              <li><strong>accept:</strong> Array of allowed MIME types or file extensions</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-700 mb-2">Features</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-700">
              <li>Client-side validation before upload (type, size, count)</li>
              <li>Drag-and-drop support with visual feedback</li>
              <li>Upload progress tracking with retry/cancel</li>
              <li>File preview with remove functionality</li>
              <li>Submitted data includes file metadata (fileId, url, name, size, mimeType, checksum)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submitted Data Display */}
      {submittedData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="font-semibold text-green-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Submitted Data
          </h3>
          <pre className="bg-white p-4 rounded border border-green-200 overflow-x-auto text-sm">
            {JSON.stringify(submittedData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
