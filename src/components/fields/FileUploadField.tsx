'use client';

/**
 * File Upload Field Component
 * 
 * Renders a file upload input with:
 * - Drag-and-drop support
 * - File validation (type, size, count)
 * - Upload progress tracking
 * - File preview/list
 * - Remove and retry functionality
 */

import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import FieldWrapper from '../layout/FieldWrapper';
import { useFileUpload, type OnUploadCallback } from '../form-component/hooks/useFileUpload';
import type { FileValidationRules } from '@/lib/file-validation/validators';
import { formatFileSize, formatAcceptedTypes } from '@/lib/file-validation/validators';

export interface FileUploadFieldProps<TFieldValues extends FieldValues = FieldValues> {
  name: Path<TFieldValues>;
  control: Control<TFieldValues>;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rules?: FileValidationRules;
  onUpload?: OnUploadCallback;
}

export function FileUploadField<TFieldValues extends FieldValues = FieldValues>({
  name,
  control,
  label,
  description,
  placeholder = 'Click or drag files here to upload',
  required = false,
  disabled = false,
  rules = {},
  onUpload,
}: FileUploadFieldProps<TFieldValues>) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const {
          uploadProgress,
          isUploading,
          addFiles,
          removeFile,
          retryUpload,
          uploadedFiles,
        } = useFileUpload({
          fieldKey: name,
          rules,
          onUpload,
          context: {
            userId: 'demo-user',
            locale: 'en-GB',
            correlationId: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            formMode: 'create',
          },
          currentFiles: field.value || [],
        });

        // Update form value when uploaded files change
        // Only update if the value actually changed to prevent infinite loop
        React.useEffect(() => {
          const currentValue = JSON.stringify(field.value || []);
          const newValue = JSON.stringify(uploadedFiles);
          
          if (currentValue !== newValue) {
            field.onChange(uploadedFiles);
          }
        }, [uploadedFiles]); // Only depend on uploadedFiles, not field

        const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            addFiles(files);
          }
          // Reset input value to allow re-selecting same file
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        };

        const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) {
            setIsDragOver(true);
          }
        };

        const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);
        };

        const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
        };

        const handleDrop = (e: DragEvent<HTMLDivElement>) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragOver(false);

          if (disabled) return;

          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) {
            addFiles(files);
          }
        };

        const handleClick = () => {
          if (!disabled && fileInputRef.current) {
            fileInputRef.current.click();
          }
        };

        const acceptString = rules.accept?.join(',');

        return (
          <FieldWrapper
            id={name}
            label={label}
            required={required}
            description={description}
            error={fieldState.error?.message}
          >
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple={!rules.maxFiles || rules.maxFiles > 1}
              accept={acceptString}
              onChange={handleFileInputChange}
              disabled={disabled}
              className="hidden"
              aria-label={label}
            />

            {/* Drop zone */}
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={handleClick}
              className={`
                relative rounded-lg border-2 border-dashed p-6 text-center
                transition-colors cursor-pointer
                ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${fieldState.error ? 'border-red-300' : ''}
              `}
            >
              <div className="flex flex-col items-center space-y-2">
                {/* Upload icon */}
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>

                {/* Placeholder text */}
                <p className="text-sm text-gray-600">{placeholder}</p>

                {/* File constraints */}
                <div className="text-xs text-gray-500 space-y-1">
                  {rules.accept && (
                    <p>Accepted: {formatAcceptedTypes(rules.accept)}</p>
                  )}
                  {rules.maxSizeMB && (
                    <p>Max size: {rules.maxSizeMB}MB per file</p>
                  )}
                  {rules.maxFiles && (
                    <p>
                      Max files: {rules.maxFiles}{' '}
                      {uploadedFiles.length > 0 &&
                        `(${uploadedFiles.length} uploaded)`}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Upload progress list */}
            {uploadProgress.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadProgress.map((progress, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {progress.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(progress.file.size)}
                      </p>

                      {/* Progress bar */}
                      {progress.status === 'uploading' && (
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${progress.progress}%` }}
                          />
                        </div>
                      )}

                      {/* Error message */}
                      {progress.status === 'error' && progress.error && (
                        <p className="mt-1 text-xs text-red-600">
                          {progress.error}
                        </p>
                      )}
                    </div>

                    {/* Status indicator */}
                    <div className="flex items-center space-x-2">
                      {progress.status === 'success' && (
                        <span className="text-green-600">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}

                      {progress.status === 'uploading' && (
                        <span className="text-blue-600">
                          <svg
                            className="w-5 h-5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                        </span>
                      )}

                      {progress.status === 'error' && (
                        <button
                          type="button"
                          onClick={() => retryUpload(progress.file)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                          disabled={isUploading}
                        >
                          Retry
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded files list */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">
                  Uploaded Files ({uploadedFiles.length})
                </h4>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.fileId}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {file.mimeType}
                      </p>
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View file
                        </a>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeFile(file.fileId)}
                      disabled={disabled}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      aria-label={`Remove ${file.name}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FieldWrapper>
        );
      }}
    />
  );
}
