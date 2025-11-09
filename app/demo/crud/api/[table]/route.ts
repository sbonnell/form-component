import { NextRequest, NextResponse } from "next/server";
import { initializeDB } from "../../lib/db/init";
import { listRows, insertRow, updateRow, deleteRow, selectOne } from "../../lib/db/crud";
import type { ListOptions } from "../../lib/db/crud";

export const dynamic = "force-dynamic";

/**
 * GET /api/[table] - List rows with pagination OR get single row by ID
 * Query params: 
 *   - id: number (optional) - Get single row by ID
 *   - page: number (optional, default 1)
 *   - pageSize: number (optional, default 10)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    await initializeDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    // If ID is provided, fetch single record
    if (id) {
      const recordId = parseInt(id, 10);
      if (isNaN(recordId)) {
        return NextResponse.json(
          { error: "Invalid ID parameter" },
          { status: 400 }
        );
      }

      const record = await selectOne(
        `SELECT * FROM ${table} WHERE id = ?`,
        [recordId]
      );

      if (!record) {
        return NextResponse.json(
          { error: "Record not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(record);
    }

    // Otherwise, list with pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);

    const options: ListOptions = { page, pageSize };
    const result = await listRows(table, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error listing rows:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list rows" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/[table] - Create new row
 * Body: { data: Record<string, unknown> }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    await initializeDB();
    const body = await request.json();
    const result = await insertRow(table, body.data);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error(`Error creating row:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create row" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/[table] - Update row
 * Body: { id: number, data: Record<string, unknown> }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    await initializeDB();
    const body = await request.json();
    const result = await updateRow(table, body.id, body.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error(`Error updating row:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update row" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/[table] - Delete row
 * Body: { id: number }
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ table: string }> }
) {
  try {
    const { table } = await params;
    await initializeDB();
    const body = await request.json();
    await deleteRow(table, body.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting row:`, error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete row" },
      { status: 500 }
    );
  }
}
