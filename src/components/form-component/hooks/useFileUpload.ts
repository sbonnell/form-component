/**
 * File Upload Hook
 * 
 * Manages file upload state, validation, and progress tracking.
 * Integrates with React Hook Form for form state management.
 */

import { useState, useCallback } from 'react';
import type { FileValidationRules } from '@/lib/file-validation/validators';
import { validateFiles } from '@/lib/file-validation/validators';

// Callback types
export type OnUploadCallback = (params: {
  fieldKey: string;
  files: Array<{
    name: string;
    size: number;
    type: string;
    data: File;
  }>;
  context: {
    userId: string;
    locale: string;
    correlationId: string;
    timestamp: string;
    formMode: 'create' | 'edit';
    sessionId?: string;
  };
}) => Promise<{
  files: Array<{
    fileId: string;
    url: string;
    name: string;
    size: number;
    mimeType: string;
    checksum: string;
  }>;
}>;

export interface UploadedFile {
  /** Unique file identifier from server */
  fileId: string;
  /** File access URL */
  url: string;
  /** File name */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type */
  mimeType: string;
  /** File checksum */
  checksum: string;
}

export interface UploadProgress {
  /** File being uploaded */
  file: File;
  /** Upload progress (0-100) */
  progress: number;
  /** Upload status */
  status: 'pending' | 'uploading' | 'success' | 'error';
  /** Error message if failed */
  error?: string;
  /** Uploaded file metadata if successful */
  uploadedFile?: UploadedFile;
}

export interface UseFileUploadOptions {
  /** Field key for this upload field */
  fieldKey: string;
  /** File validation rules */
  rules: FileValidationRules;
  /** Upload callback function */
  onUpload?: OnUploadCallback;
  /** Callback context for upload */
  context: {
    userId: string;
    locale: string;
    correlationId: string;
    timestamp: string;
    formMode: 'create' | 'edit';
    sessionId?: string;
  };
  /** Currently uploaded files */
  currentFiles?: UploadedFile[];
}

export interface UseFileUploadReturn {
  /** Current upload progress for each file */
  uploadProgress: UploadProgress[];
  /** Whether any upload is in progress */
  isUploading: boolean;
  /** Add files for upload */
  addFiles: (files: File[]) => Promise<void>;
  /** Remove an uploaded file */
  removeFile: (fileId: string) => void;
  /** Retry failed upload */
  retryUpload: (file: File) => Promise<void>;
  /** Cancel ongoing upload */
  cancelUpload: (file: File) => void;
  /** All successfully uploaded files */
  uploadedFiles: UploadedFile[];
}

export function useFileUpload({
  fieldKey,
  rules,
  onUpload,
  context,
  currentFiles = [],
}: UseFileUploadOptions): UseFileUploadReturn {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(currentFiles);

  const isUploading = uploadProgress.some((p) => p.status === 'uploading');

  /**
   * Upload a single file with progress tracking
   */
  const uploadFile = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      if (!onUpload) {
        console.warn('No onUpload callback provided');
        return null;
      }

      try {
        // Update progress: uploading
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.file === file
              ? { ...p, status: 'uploading' as const, progress: 0 }
              : p
          )
        );

        // Simulate progress (in real implementation, use XMLHttpRequest or fetch with progress)
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) =>
            prev.map((p) =>
              p.file === file && p.status === 'uploading'
                ? { ...p, progress: Math.min(p.progress + 10, 90) }
                : p
            )
          );
        }, 200);

        // Call upload callback
        const response = await onUpload({
          fieldKey,
          files: [
            {
              name: file.name,
              size: file.size,
              type: file.type,
              data: file,
            },
          ],
          context,
        });

        clearInterval(progressInterval);

        const uploadedFile = response.files[0];

        // Update progress: success
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.file === file
              ? {
                  ...p,
                  status: 'success' as const,
                  progress: 100,
                  uploadedFile,
                }
              : p
          )
        );

        return uploadedFile;
      } catch (error) {
        // Update progress: error
        const errorMessage =
          error instanceof Error ? error.message : 'Upload failed';

        setUploadProgress((prev) =>
          prev.map((p) =>
            p.file === file
              ? {
                  ...p,
                  status: 'error' as const,
                  error: errorMessage,
                }
              : p
          )
        );

        return null;
      }
    },
    [fieldKey, onUpload, context]
  );

  /**
   * Add files for upload
   */
  const addFiles = useCallback(
    async (files: File[]) => {
      // Validate files
      const validation = validateFiles(files, rules, uploadedFiles.length);

      if (!validation.valid) {
        // Add failed files to progress with error status
        const failedProgress: UploadProgress[] = validation.errors.map(
          (error) => ({
            file: error.file,
            progress: 0,
            status: 'error' as const,
            error: error.message,
          })
        );

        setUploadProgress((prev) => [...prev, ...failedProgress]);
        return;
      }

      // Add valid files to progress as pending
      const newProgress: UploadProgress[] = validation.validFiles.map(
        (file) => ({
          file,
          progress: 0,
          status: 'pending' as const,
        })
      );

      setUploadProgress((prev) => [...prev, ...newProgress]);

      // Upload files sequentially
      for (const file of validation.validFiles) {
        const uploadedFile = await uploadFile(file);

        if (uploadedFile) {
          setUploadedFiles((prev) => [...prev, uploadedFile]);
        }
      }
    },
    [rules, uploadedFiles.length, uploadFile]
  );

  /**
   * Remove an uploaded file
   */
  const removeFile = useCallback((fileId: string) => {
    setUploadedFiles((prev) => prev.filter((f) => f.fileId !== fileId));
    setUploadProgress((prev) =>
      prev.filter((p) => p.uploadedFile?.fileId !== fileId)
    );
  }, []);

  /**
   * Retry failed upload
   */
  const retryUpload = useCallback(
    async (file: File) => {
      // Reset progress status
      setUploadProgress((prev) =>
        prev.map((p) =>
          p.file === file
            ? { ...p, status: 'pending' as const, error: undefined }
            : p
        )
      );

      const uploadedFile = await uploadFile(file);

      if (uploadedFile) {
        setUploadedFiles((prev) => [...prev, uploadedFile]);
      }
    },
    [uploadFile]
  );

  /**
   * Cancel ongoing upload (placeholder - requires AbortController in real implementation)
   */
  const cancelUpload = useCallback((file: File) => {
    setUploadProgress((prev) =>
      prev.map((p) =>
        p.file === file
          ? {
              ...p,
              status: 'error' as const,
              error: 'Upload cancelled by user',
            }
          : p
      )
    );
  }, []);

  return {
    uploadProgress,
    isUploading,
    addFiles,
    removeFile,
    retryUpload,
    cancelUpload,
    uploadedFiles,
  };
}
