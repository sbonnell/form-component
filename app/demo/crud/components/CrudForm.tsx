"use client";

import { useState, useEffect } from "react";
import SchemaForm from "@/components/form-component/SchemaForm";
import type { FormSchema } from "@/types/schema";
import type { FormCallbacks, CallbackContext } from "@/types/callbacks";
import { SchemaViewer } from "../../../demo/components/SchemaViewer";

export interface CrudFormProps {
  /** Table name for API calls */
  tableName: string;
  
  /** Form schema generated from Drizzle table */
  schema: FormSchema;
  
  /** Form mode: create or edit */
  mode: "create" | "edit";
  
  /** Record ID (required for edit mode) */
  recordId?: number;
  
  /** Initial data for edit mode (optional - will be fetched if not provided) */
  initialData?: Record<string, any>;
  
  /** Callback when form is successfully submitted */
  onSuccess?: (data: any) => void;
  
  /** Callback when form is cancelled */
  onCancel?: () => void;
}

/**
 * Generic CRUD form component
 * Uses SchemaForm with API integration for create/edit operations
 * Automatically fetches record data in edit mode if not provided
 */
export function CrudForm({
  tableName,
  schema,
  mode,
  recordId,
  initialData,
  onSuccess,
  onCancel,
}: CrudFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<Record<string, any> | null>(null);
  const [fetchingData, setFetchingData] = useState(false);

  // Fetch record data for edit mode if not provided
  useEffect(() => {
    async function fetchRecord() {
      if (mode !== "edit" || !recordId || initialData) {
        return; // Skip if not edit mode, no ID, or data already provided
      }

      setFetchingData(true);
      setError(null);

      try {
        const response = await fetch(`/demo/crud/api/${tableName}?id=${recordId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Record not found. It may have been deleted.");
          }
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch record");
        }

        const result = await response.json();
        setFetchedData(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch record";
        setError(errorMessage);
      } finally {
        setFetchingData(false);
      }
    }

    fetchRecord();
  }, [mode, recordId, tableName, initialData]);

  // Determine which data to use
  const formData = initialData || fetchedData || undefined;

  // Don't render form until we have data in edit mode
  if (mode === "edit" && !formData) {
    if (fetchingData) {
      return (
        <div className="crud-form p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-sm text-gray-600">Loading record...</p>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="crud-form">
          <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
            <h3 className="text-sm font-medium">Error Loading Record</h3>
            <p className="mt-1 text-sm">{error}</p>
          </div>
        </div>
      );
    }
    
    return null; // Still loading
  }

  // Form callbacks
  const callbacks: FormCallbacks = {
    onSubmit: async (params) => {
      const { rawData } = params;
      setError(null);
      setLoading(true);

      try {
        let response;

        if (mode === "create") {
          // POST to create new record
          response = await fetch(`/demo/crud/api/${tableName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ data: rawData }),
          });
        } else {
          // PUT to update existing record
          if (!recordId) {
            throw new Error("Record ID is required for edit mode");
          }

          response = await fetch(`/demo/crud/api/${tableName}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: recordId, data: rawData }),
          });
        }

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to ${mode} record`);
        }

        const result = await response.json();
        
        // Call success callback
        if (onSuccess) {
          onSuccess(result);
        }

        return {
          ok: true,
          id: result.id?.toString(),
          message: `Record ${mode === "create" ? "created" : "updated"} successfully`,
        };
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : `Failed to ${mode} record`;
        setError(errorMessage);
        
        return {
          ok: false,
          message: errorMessage,
        };
      } finally {
        setLoading(false);
      }
    },
  };

  // Form context
  const context: CallbackContext = {
    formMode: mode,
    userId: "demo-user",
    locale: "en-US",
    correlationId: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="crud-form">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <h3 className="text-sm font-medium">Error</h3>
          <p className="mt-1 text-sm">{error}</p>
        </div>
      )}

      <SchemaViewer schema={schema} title="View Form Schema" />

      <SchemaForm
        schema={schema}
        callbacks={callbacks}
        context={context}
        initialData={formData}
      />

      {loading && (
        <div className="mt-4 text-center text-sm text-gray-500">
          {mode === "create" ? "Creating..." : "Saving..."}
        </div>
      )}
    </div>
  );
}
