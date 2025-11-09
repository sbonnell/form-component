"use client";

import { useState } from "react";

/**
 * Generic list configuration for a table
 */
export interface ColumnConfig {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "currency" | "enum";
  format?: (value: any) => string;
  truncate?: number; // Max characters before truncating
}

export interface CrudListProps<T extends Record<string, any>> {
  title: string;
  data: T[];
  columns: ColumnConfig[];
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit?: (record: T) => void;
  onDelete?: (record: T) => void;
  onCreate?: () => void;
  onReset?: () => void;
  loading?: boolean;
}

/**
 * Format value based on column type
 */
function formatValue(value: any, column: ColumnConfig): string {
  if (value === null || value === undefined) {
    return "—";
  }

  // Use custom formatter if provided
  if (column.format) {
    return column.format(value);
  }

  // Apply type-specific formatting
  switch (column.type) {
    case "date": {
      const date = new Date(value);
      return date.toLocaleDateString();
    }
    case "currency": {
      const num = parseFloat(value);
      return isNaN(num) ? String(value) : `$${num.toFixed(2)}`;
    }
    case "number": {
      return String(value);
    }
    case "enum":
    case "text":
    default: {
      let text = String(value);
      
      // Apply truncation if specified
      if (column.truncate && text.length > column.truncate) {
        return text.substring(0, column.truncate) + "…";
      }
      
      return text;
    }
  }
}

/**
 * Generic CRUD list view component with pagination
 */
export function CrudList<T extends Record<string, any>>({
  title,
  data,
  columns,
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  onCreate,
  onReset,
  loading = false,
}: CrudListProps<T>) {
  const totalPages = Math.ceil(totalRecords / pageSize);
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {totalRecords === 0
              ? "No records found"
              : `Showing ${startRecord}–${endRecord} of ${totalRecords} records`}
          </p>
        </div>
        <div className="flex gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={loading}
            >
              Reset Demo Data
            </button>
          )}
          {onCreate && (
            <button
              onClick={onCreate}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={loading}
            >
              Add New
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500">Loading...</div>
        </div>
      ) : data.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300">
          <p className="text-gray-500">No records found</p>
          {onCreate && (
            <button
              onClick={onCreate}
              className="mt-4 text-sm text-indigo-600 hover:text-indigo-700"
            >
              Create your first record
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-gray-200 shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      {column.label}
                    </th>
                  ))}
                  {(onEdit || onDelete) && (
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {data.map((record, idx) => (
                  <tr key={record.id || idx} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="whitespace-nowrap px-6 py-4 text-sm text-gray-900"
                      >
                        {formatValue(record[column.key], column)}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(record)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              Edit
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => onDelete(record)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
