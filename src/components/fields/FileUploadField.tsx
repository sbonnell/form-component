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
 * 
 * Migrated to use shadcn/ui components.
 */

import React, { useRef, useState, DragEvent, ChangeEvent } from 'react';
import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import FieldWrapper from '../layout/FieldWrapper';
import { useFileUpload, type OnUploadCallback } from '../form-component/hooks/useFileUpload';
import type { FileValidationRules } from '@/lib/file-validation/validators';
import { formatFileSize, formatAcceptedTypes } from '@/lib/file-validation/validators';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, X, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
              className={cn(
                'relative rounded-lg border-2 border-dashed p-6 text-center transition-colors cursor-pointer',
                isDragOver && 'border-primary bg-primary/5',
                !isDragOver && 'border-input hover:border-primary/50',
                disabled && 'opacity-50 cursor-not-allowed',
                fieldState.error && 'border-destructive'
              )}
            >
              <div className="flex flex-col items-center space-y-2">
                <Upload className="h-12 w-12 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">{placeholder}</p>

                <div className="text-xs text-muted-foreground space-y-1">
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
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium truncate">
                        {progress.file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(progress.file.size)}
                      </p>

                      {progress.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={progress.progress} className="h-1.5" />
                        </div>
                      )}

                      {progress.status === 'error' && progress.error && (
                        <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {progress.error}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      {progress.status === 'success' && (
                        <Check className="h-5 w-5 text-green-600" />
                      )}

                      {progress.status === 'uploading' && (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      )}

                      {progress.status === 'error' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => retryUpload(progress.file)}
                          disabled={isUploading}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded files list */}
            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium">
                  Uploaded Files ({uploadedFiles.length})
                </h4>
                {uploadedFiles.map((file) => (
                  <div
                    key={file.fileId}
                    className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-medium truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.mimeType}
                      </p>
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          View file
                        </a>
                      )}
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.fileId)}
                      disabled={disabled}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
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
