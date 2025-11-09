"use client";

import { useEffect, useState } from "react";
import { CrudList, type ColumnConfig } from "../components/CrudList";
import { CrudForm } from "../components/CrudForm";
import type { Transaction } from "../lib/db/schema";
import { transactions } from "../lib/db/schema";
import { drizzleTableToFormSchema } from "@/lib/generator";

const columns: ColumnConfig[] = [
  { key: "id", label: "ID", type: "number" },
  { key: "user_id", label: "User ID", type: "number" },
  { key: "amount", label: "Amount", type: "currency" },
  { key: "date", label: "Date", type: "date" },
  { key: "status", label: "Status", type: "enum" },
  { key: "type", label: "Type", type: "enum" },
  { key: "description", label: "Description", type: "text", truncate: 100 },
];

// Generate form schema from Drizzle table definition
const transactionFormSchema = drizzleTableToFormSchema(transactions, "transactions");

export default function TransactionsPage() {
  const [data, setData] = useState<Transaction[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Transaction | null>(null);
  
  const pageSize = 10;

  const loadData = async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch paginated data from API route
      const response = await fetch(
        `/demo/crud/api/transactions?page=${page}&pageSize=${pageSize}`
      );
      
      if (!response.ok) {
        throw new Error(`Failed to load transactions: ${response.statusText}`);
      }
      
      const result = await response.json();
      setData(result.data);
      setTotalRecords(result.total);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error loading transactions:", err);
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset the demo data? This will delete all records and reload sample data.")) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch("/demo/crud/api/reset", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error("Failed to reset database");
      }
      
      await loadData(1);
    } catch (err) {
      console.error("Error resetting data:", err);
      setError(err instanceof Error ? err.message : "Failed to reset data");
    }
  };

  const handleDelete = async (record: Transaction) => {
    if (!confirm(`Are you sure you want to delete transaction #${record.id}? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/demo/crud/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete transaction");
      }

      // Reload current page, or go to previous page if current page is now empty
      const remainingRecords = totalRecords - 1;
      const maxPage = Math.ceil(remainingRecords / pageSize) || 1;
      const targetPage = currentPage > maxPage ? maxPage : currentPage;
      
      await loadData(targetPage);
    } catch (err) {
      console.error("Error deleting transaction:", err);
      setError(err instanceof Error ? err.message : "Failed to delete transaction");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(1);
  }, []);

  if (error) {
    return (
      <div className="p-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <button
            onClick={() => loadData(currentPage)}
            className="mt-3 text-sm font-medium text-red-600 hover:text-red-500"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        {!showCreateForm && !editingRecord && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Add New Transaction
          </button>
        )}
      </div>

      {showCreateForm ? (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Transaction</h2>
          <CrudForm
            tableName="transactions"
            schema={transactionFormSchema}
            mode="create"
            onSuccess={() => {
              setShowCreateForm(false);
              loadData(1);
            }}
            onCancel={() => setShowCreateForm(false)}
          />
          <button
            onClick={() => setShowCreateForm(false)}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      ) : editingRecord ? (
        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Edit Transaction</h2>
          <CrudForm
            tableName="transactions"
            schema={transactionFormSchema}
            mode="edit"
            recordId={editingRecord.id}
            onSuccess={() => {
              setEditingRecord(null);
              loadData(currentPage);
            }}
            onCancel={() => setEditingRecord(null)}
          />
          <button
            onClick={() => setEditingRecord(null)}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      ) : (
        <CrudList
          title="Transactions"
          data={data}
          columns={columns}
          totalRecords={totalRecords}
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={(page) => loadData(page)}
          onEdit={(record) => setEditingRecord(record)}
          onDelete={handleDelete}
          onReset={handleReset}
          loading={loading}
        />
      )}
    </div>
  );
}
