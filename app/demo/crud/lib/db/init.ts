import { saveDatabase, getSqlDb } from "./client";
import { seedDatabase } from "./seed";

/**
 * Initialize database on first access
 * - Creates tables if they don't exist
 * - Seeds sample data if tables are empty
 */
export async function initializeDB() {
  const sqlDb = await getSqlDb();
  if (!sqlDb) throw new Error("Failed to initialize database");

  console.log("Initializing database schema...");

  // Create tables using raw SQL via sql.js
  const createTablesSql = `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      age INTEGER,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      type TEXT NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS goods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      category TEXT NOT NULL,
      stock_quantity INTEGER NOT NULL,
      sku TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS email_idx ON users(email);
    CREATE INDEX IF NOT EXISTS user_id_idx ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS sku_idx ON goods(sku);
    CREATE INDEX IF NOT EXISTS category_idx ON goods(category);
  `;

  // Split and execute each statement
  const statements = createTablesSql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    sqlDb.run(stmt);
  }

  await saveDatabase();

  // Seed database if empty
  await seedDatabase();

  console.log("Database initialized successfully!");
}

/**
 * Export database utilities for convenience
 */
export { getDatabase, saveDatabase, resetDatabase, closeDatabase, getSqlDb } from "./client";
export * from "./schema";
