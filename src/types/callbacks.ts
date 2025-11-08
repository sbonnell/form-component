/**
 * Callback Function Type Definitions
 * 
 * Defines all callback function signatures that consumer applications
 * must implement to integrate with the form component.
 */

import type { FormMeta } from './schema';

/**
 * Context information passed to all callbacks
 */
export interface CallbackContext {
  /** Current user identifier */
  userId: string;
  
  /** User's locale (e.g., "en-GB") */
  locale: string;
  
  /** Unique request ID for tracing */
  correlationId: string;
  
  /** Request timestamp (ISO 8601) */
  timestamp: string;
  
  /** Current form mode */
  formMode: 'create' | 'edit';
  
  /** User session identifier */
  sessionId?: string;
}

/**
 * Initial data loading callback
 * 
 * Called before form render in edit mode or when explicitly triggered.
 * Provides initial field values for the form.
 */
export type OnLoadCallback = (params: {
  /** Form metadata */
  schemaMeta: FormMeta;
  
  /** Callback context */
  context: CallbackContext;
}) => Promise<OnLoadResponse>;

export interface OnLoadResponse {
  /** Initial field values keyed by field name */
  initialData: Record<string, any>;
  
  /** Optional metadata for downstream callbacks */
  meta?: Record<string, any>;
}

/**
 * Dynamic options loading callback
 * 
 * Called for select/multiselect fields with remote data sources.
 * Supports search, pagination, and dependent field filtering.
 */
export type OnOptionsCallback = (params: {
  /** Option source name from schema */
  name: string;
  
  /** Current search query string */
  query: string;
  
  /** Dependent field values */
  dependsOn: Record<string, any>;
  
  /** Opaque pagination token */
  pageToken?: string;
  
  /** Callback context */
  context: CallbackContext;
}) => Promise<OnOptionsResponse>;

export interface OnOptionsResponse {
  /** Array of option items */
  options: Array<{
    /** Option value (stored in form) */
    value: any;
    
    /** Option label (displayed to user) */
    label: string;
    
    /** Whether option is disabled */
    disabled?: boolean;
  }>;
  
  /** Token for next page (if more results exist) */
  nextPageToken?: string;
}

/**
 * File upload callback
 * 
 * Called when user selects files for upload.
 * Should handle file upload to server and return file metadata.
 */
export type OnUploadCallback = (params: {
  /** Field key for the upload field */
  fieldKey: string;
  
  /** Array of files to upload */
  files: Array<{
    /** File name */
    name: string;
    
    /** File size in bytes */
    size: number;
    
    /** MIME type */
    type: string;
    
    /** File data (for actual upload) */
    data: File;
  }>;
  
  /** Callback context */
  context: CallbackContext;
}) => Promise<OnUploadResponse>;

export interface OnUploadResponse {
  /** Array of uploaded file metadata */
  files: Array<{
    /** Unique file identifier */
    fileId: string;
    
    /** File access URL */
    url: string;
    
    /** File name */
    name: string;
    
    /** File size in bytes */
    size: number;
    
    /** MIME type */
    mimeType: string;
    
    /** File checksum (e.g., SHA-256) */
    checksum: string;
  }>;
}

/**
 * Form submission callback
 * 
 * Called when user submits the form.
 * Receives complete form data and list of changed fields.
 */
export type OnSubmitCallback = (params: {
  /** Complete form data (all field values) */
  rawData: Record<string, any>;
  
  /** Map of changed fields (true if changed from initial) */
  changedFields: Record<string, boolean>;
  
  /** Form metadata */
  schemaMeta: FormMeta;
  
  /** Callback context */
  context: CallbackContext;
}) => Promise<OnSubmitResponse>;

export type OnSubmitResponse = OnSubmitSuccess | OnSubmitFailure;

export interface OnSubmitSuccess {
  /** Success indicator */
  ok: true;
  
  /** Created/updated entity ID */
  id?: string;
  
  /** Success message */
  message?: string;
}

export interface OnSubmitFailure {
  /** Failure indicator */
  ok: false;
  
  /** Error message */
  message: string;
  
  /** Field-specific errors (using dot-notation for nested fields) */
  fieldErrors?: Record<string, string>;
}

/**
 * Optional lifecycle hook: Before submit
 * 
 * Called before validation and submission.
 * Can transform data or throw to prevent submission.
 */
export type OnBeforeSubmitHook = (params: {
  /** Current form data */
  rawData: Record<string, any>;
  
  /** Callback context */
  context: CallbackContext;
}) => Promise<{
  /** Potentially transformed form data */
  rawData: Record<string, any>;
}> | {
  /** Potentially transformed form data */
  rawData: Record<string, any>;
};

/**
 * Optional lifecycle hook: After submit
 * 
 * Called after successful or failed submission.
 * Useful for toast notifications, redirects, analytics.
 */
export type OnAfterSubmitHook = (params: {
  /** Submission result */
  result: OnSubmitResponse;
  
  /** Callback context */
  context: CallbackContext;
}) => Promise<void> | void;

/**
 * All callback functions bundled together
 */
export interface FormCallbacks {
  /** Initial data loading */
  onLoad?: OnLoadCallback;
  
  /** Dynamic options loading */
  onOptions?: OnOptionsCallback;
  
  /** File upload handling */
  onUpload?: OnUploadCallback;
  
  /** Form submission */
  onSubmit: OnSubmitCallback;
  
  /** Before submit hook */
  onBeforeSubmit?: OnBeforeSubmitHook;
  
  /** After submit hook */
  onAfterSubmit?: OnAfterSubmitHook;
}
