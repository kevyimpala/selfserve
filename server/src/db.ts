import sqlite3 from "sqlite3";
import { open, type Database } from "sqlite";
import { config } from "./config.js";

let dbPromise: Promise<Database<sqlite3.Database, sqlite3.Statement>> | null = null;

export const getDb = async () => {
  if (!dbPromise) {
    dbPromise = open({
      filename: config.databasePath,
      driver: sqlite3.Database
    }).then(async (db) => {
      await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        );
      `);

      const userColumns = await db.all<{ name: string }[]>("PRAGMA table_info(users)");
      const userColumnNames = new Set(userColumns.map((column) => column.name));

      if (!userColumnNames.has("username")) {
        await db.exec("ALTER TABLE users ADD COLUMN username TEXT;");
      }
      if (!userColumnNames.has("age")) {
        await db.exec("ALTER TABLE users ADD COLUMN age INTEGER;");
      }
      if (!userColumnNames.has("identity")) {
        await db.exec("ALTER TABLE users ADD COLUMN identity TEXT;");
      }
      if (!userColumnNames.has("onboarding_completed")) {
        await db.exec("ALTER TABLE users ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 0;");
      }
      if (!userColumnNames.has("email_verified")) {
        await db.exec("ALTER TABLE users ADD COLUMN email_verified INTEGER NOT NULL DEFAULT 0;");
      }
      if (!userColumnNames.has("verification_code")) {
        await db.exec("ALTER TABLE users ADD COLUMN verification_code TEXT;");
      }
      if (!userColumnNames.has("verification_expires_at")) {
        await db.exec("ALTER TABLE users ADD COLUMN verification_expires_at TEXT;");
      }
      if (!userColumnNames.has("password_reset_code")) {
        await db.exec("ALTER TABLE users ADD COLUMN password_reset_code TEXT;");
      }
      if (!userColumnNames.has("password_reset_expires_at")) {
        await db.exec("ALTER TABLE users ADD COLUMN password_reset_expires_at TEXT;");
      }

      await db.exec("CREATE UNIQUE INDEX IF NOT EXISTS users_username_unique ON users(username);");

      await db.exec(`
        CREATE TABLE IF NOT EXISTS pantry_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          quantity REAL NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `);

      await db.exec(`
        CREATE TABLE IF NOT EXISTS uploads (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          image_base64 TEXT NOT NULL,
          ingredients_json TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES users(id)
        );
      `);

      return db;
    });
  }

  return dbPromise;
};
