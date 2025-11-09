import { getSqlDb, saveDatabase, getDatabase } from "./client";

/**
 * Generic CRUD operations for any table
 * Works with sql.js and Drizzle ORM
 */

export interface ListOptions {
  page?: number;
  pageSize?: number;
}

export interface ListResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

/**
 * Execute a SELECT query and return results
 */
export async function selectRows<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const sqlDb = await getSqlDb();
  if (!sqlDb) throw new Error("Database not initialized");

  const results = sqlDb.exec(query, params);
  if (results.length === 0) return [];

  const columns = results[0].columns;
  const rows = results[0].values || [];

  return rows.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as T;
  });
}

/**
 * Execute a query that returns a single row
 */
export async function selectOne<T = any>(
  query: string,
  params: any[] = []
): Promise<T | null> {
  const results = await selectRows<T>(query, params);
  return results.length > 0 ? results[0] : null;
}

/**
 * Execute a COUNT query
 */
export async function countRows(
  query: string,
  params: any[] = []
): Promise<number> {
  const result = await selectOne<{ count: number }>(query, params);
  return result?.count || 0;
}

/**
 * Insert a row and return the inserted row
 */
export async function insertRow<T = any>(
  tableName: string,
  data: Record<string, any>
): Promise<T> {
  const sqlDb = await getSqlDb();
  if (!sqlDb) throw new Error("Database not initialized");

  // Add timestamps for tables that require them
  const dataWithTimestamps = { ...data };
  const now = new Date().toISOString();
  
  if (tableName === 'users' || tableName === 'goods') {
    if (!dataWithTimestamps.created_at) {
      dataWithTimestamps.created_at = now;
    }
  }
  
  if (tableName === 'transactions' && !dataWithTimestamps.date) {
    dataWithTimestamps.date = now;
  }

  const columns = Object.keys(dataWithTimestamps);
  const values = Object.values(dataWithTimestamps);
  const placeholders = columns.map(() => "?").join(", ");

  const insertQuery = `
    INSERT INTO ${tableName} (${columns.join(", ")})
    VALUES (${placeholders})
  `;

  sqlDb.run(insertQuery, values);
  
  // Get the last inserted ID using sql.js API
  const lastIdQuery = "SELECT last_insert_rowid() as id";
  const idResults = sqlDb.exec(lastIdQuery);
  
  if (!idResults || idResults.length === 0 || !idResults[0].values[0]) {
    throw new Error("Failed to get inserted row ID");
  }
  
  const insertedId = idResults[0].values[0][0] as number;
  
  await saveDatabase();

  // Return the full row
  const row = await selectOne<T>(
    `SELECT * FROM ${tableName} WHERE id = ?`,
    [insertedId]
  );

  if (!row) throw new Error("Failed to retrieve inserted row");

  return row;
}

/**
 * Update a row
 */
export async function updateRow<T = any>(
  tableName: string,
  id: number,
  data: Record<string, any>
): Promise<T> {
  const sqlDb = await getSqlDb();
  if (!sqlDb) throw new Error("Database not initialized");

  const columns = Object.keys(data);
  const values = [...Object.values(data), id];
  const setClause = columns.map((col) => `${col} = ?`).join(", ");

  const updateQuery = `
    UPDATE ${tableName}
    SET ${setClause}
    WHERE id = ?
  `;

  sqlDb.run(updateQuery, values);
  await saveDatabase();

  // Return the updated row
  const row = await selectOne<T>(
    `SELECT * FROM ${tableName} WHERE id = ?`,
    [id]
  );

  if (!row) throw new Error("Row not found after update");

  return row;
}

/**
 * Delete a row
 * Throws descriptive error for foreign key constraints
 */
export async function deleteRow(
  tableName: string,
  id: number
): Promise<void> {
  const sqlDb = await getSqlDb();
  if (!sqlDb) throw new Error("Database not initialized");

  try {
    const deleteQuery = `DELETE FROM ${tableName} WHERE id = ?`;
    sqlDb.run(deleteQuery, [id]);
    await saveDatabase();
  } catch (error) {
    // Check for foreign key constraint violation
    if (error instanceof Error && error.message.includes("FOREIGN KEY constraint failed")) {
      throw new Error(
        `Cannot delete this record because it is referenced by other records. Please delete the dependent records first.`
      );
    }
    throw error;
  }
}

/**
 * Get a paginated list of rows
 */
export async function listRows<T = any>(
  tableName: string,
  options: ListOptions = {}
): Promise<ListResult<T>> {
  const page = options.page || 1;
  const pageSize = options.pageSize || 10;
  const offset = (page - 1) * pageSize;

  // Get total count
  const total = await countRows(`SELECT COUNT(*) as count FROM ${tableName}`);

  // Get paginated data
  const data = await selectRows<T>(
    `SELECT * FROM ${tableName} LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get a single row by ID
 */
export async function getRow<T = any>(
  tableName: string,
  id: number
): Promise<T | null> {
  return selectOne<T>(
    `SELECT * FROM ${tableName} WHERE id = ?`,
    [id]
  );
}

/**
 * Validate unique constraint
 */
export async function isUnique(
  tableName: string,
  field: string,
  value: any,
  excludeId?: number
): Promise<boolean> {
  let query = `SELECT COUNT(*) as count FROM ${tableName} WHERE ${field} = ?`;
  const params: any[] = [value];

  if (excludeId !== undefined) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }

  const result = await selectOne<{ count: number }>(query, params);
  return (result?.count || 0) === 0;
}
