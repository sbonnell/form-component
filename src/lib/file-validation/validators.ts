/**
 * File Validation Utilities
 * 
 * Client-side validation for file uploads:
 * - MIME type checking
 * - File size limits
 * - File count limits
 */

export interface FileValidationRules {
  /** Maximum files allowed */
  maxFiles?: number;
  /** Maximum size per file in MB */
  maxSizeMB?: number;
  /** Allowed MIME types or extensions */
  accept?: string[];
}

export interface FileValidationError {
  /** File that failed validation */
  file: File;
  /** Error type */
  type: 'invalid-type' | 'file-too-large' | 'too-many-files';
  /** Human-readable error message */
  message: string;
}

export interface FileValidationResult {
  /** Whether all files are valid */
  valid: boolean;
  /** Array of validation errors */
  errors: FileValidationError[];
  /** Valid files that passed all checks */
  validFiles: File[];
}

/**
 * Validate file type against allowed MIME types or extensions
 */
export function validateFileType(file: File, accept?: string[]): boolean {
  if (!accept || accept.length === 0) {
    return true; // No restrictions
  }

  const fileName = file.name.toLowerCase();
  const fileMimeType = file.type.toLowerCase();

  return accept.some((acceptValue) => {
    const acceptLower = acceptValue.toLowerCase().trim();

    // Check for wildcard MIME type (e.g., "image/*")
    if (acceptLower.includes('/*')) {
      const baseType = acceptLower.split('/')[0];
      return fileMimeType.startsWith(baseType + '/');
    }

    // Check for exact MIME type match
    if (acceptLower.includes('/')) {
      return fileMimeType === acceptLower;
    }

    // Check for file extension (e.g., ".pdf")
    if (acceptLower.startsWith('.')) {
      return fileName.endsWith(acceptLower);
    }

    // Check for extension without dot (e.g., "pdf")
    return fileName.endsWith('.' + acceptLower);
  });
}

/**
 * Validate file size against maximum allowed size
 */
export function validateFileSize(file: File, maxSizeMB?: number): boolean {
  if (!maxSizeMB || maxSizeMB <= 0) {
    return true; // No size limit
  }

  const maxBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxBytes;
}

/**
 * Validate total file count
 */
export function validateFileCount(
  currentCount: number,
  maxFiles?: number
): boolean {
  if (!maxFiles || maxFiles <= 0) {
    return true; // No count limit
  }

  return currentCount <= maxFiles;
}

/**
 * Validate multiple files against all rules
 */
export function validateFiles(
  files: File[],
  rules: FileValidationRules,
  existingFileCount = 0
): FileValidationResult {
  const errors: FileValidationError[] = [];
  const validFiles: File[] = [];

  // Check total count (existing + new files)
  const totalCount = existingFileCount + files.length;
  if (!validateFileCount(totalCount, rules.maxFiles)) {
    // All files fail if count exceeded
    files.forEach((file) => {
      errors.push({
        file,
        type: 'too-many-files',
        message: `Maximum ${rules.maxFiles} file${
          rules.maxFiles === 1 ? '' : 's'
        } allowed. Currently have ${existingFileCount}, attempting to add ${
          files.length
        }.`,
      });
    });

    return { valid: false, errors, validFiles: [] };
  }

  // Validate each file individually
  for (const file of files) {
    // Check file type
    if (!validateFileType(file, rules.accept)) {
      errors.push({
        file,
        type: 'invalid-type',
        message: `File type "${file.type || 'unknown'}" not allowed. Accepted types: ${
          rules.accept?.join(', ') || 'any'
        }`,
      });
      continue;
    }

    // Check file size
    if (!validateFileSize(file, rules.maxSizeMB)) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      errors.push({
        file,
        type: 'file-too-large',
        message: `File size ${sizeMB}MB exceeds maximum ${rules.maxSizeMB}MB`,
      });
      continue;
    }

    // File passed all validations
    validFiles.push(file);
  }

  return {
    valid: errors.length === 0,
    errors,
    validFiles,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filename.slice(lastDot + 1).toLowerCase();
}

/**
 * Generate human-readable list of accepted file types
 */
export function formatAcceptedTypes(accept?: string[]): string {
  if (!accept || accept.length === 0) {
    return 'All file types';
  }

  const formatted = accept.map((type) => {
    if (type.includes('/*')) {
      return type.split('/')[0] + ' files';
    }
    if (type.startsWith('.')) {
      return type.toUpperCase();
    }
    if (type.includes('/')) {
      return type.split('/')[1].toUpperCase();
    }
    return type.toUpperCase();
  });

  return formatted.join(', ');
}
