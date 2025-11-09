import initSqlJs, { Database } from "sql.js";
import { drizzle } from "drizzle-orm/sql-js";
import fs from "fs";
import path from "path";
import * as schema from "./schema";

let db: any = null;
let sqlDb: Database | null = null;

const DB_PATH = path.join(process.cwd(), "app/demo/crud/demo.db");
const DB_DIR = path.dirname(DB_PATH);

/**
 * Ensure database directory exists
 */
function ensureDbDir() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

/**
 * Initialize SQLite database with sql.js
 * This loads an existing database file or creates a new one
 */
export async function initializeDatabase() {
  if (db) return db;

  ensureDbDir();

  // Configure sql.js to load WASM file from node_modules
  const wasmBinary = fs.readFileSync(
    path.join(process.cwd(), "node_modules/sql.js/dist/sql-wasm.wasm")
  );
  
  const SQL = await initSqlJs({
    wasmBinary: wasmBinary.buffer as ArrayBuffer,
  });

  let data: any = undefined;
  if (fs.existsSync(DB_PATH)) {
    data = fs.readFileSync(DB_PATH);
  }

  sqlDb = new SQL.Database(data);
  db = drizzle(sqlDb, { schema });

  return db;
}

/**
 * Get the database instance, initializing if needed
 */
export async function getDatabase() {
  if (!db) {
    await initializeDatabase();
  }
  return db;
}

/**
 * Get the underlying sql.js Database instance
 * Used for raw SQL operations and schema creation
 */
export async function getSqlDb(): Promise<Database | null> {
  if (!db) {
    await initializeDatabase();
  }
  return sqlDb;
}

/**
 * Execute raw SQL query
 */
export async function runSql(sql: string) {
  const database = await getSqlDb();
  if (!database) throw new Error("Database not initialized");
  database.run(sql);
}

/**
 * Save database to file
 * sql.js keeps database in memory, so we need to export and save
 */
export async function saveDatabase() {
  if (!sqlDb) return;

  ensureDbDir();

  const data = sqlDb.export();
  const buffer = Buffer.from(data);

  fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Close database and clean up
 */
export async function closeDatabase() {
  if (db) {
    await saveDatabase();
    db = null;
  }
  if (sqlDb) {
    sqlDb.close();
    sqlDb = null;
  }
}

/**
 * Reset database (delete file if exists)
 * Call this to start fresh
 */
export async function resetDatabase() {
  await closeDatabase();
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }
}

/**
 * Check if database is initialized
 */
export function isDbInitialized(): boolean {
  return db !== null;
}
