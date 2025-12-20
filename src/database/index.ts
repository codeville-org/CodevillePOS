import Database, { type Database as DatabaseT } from "better-sqlite3";
import { BetterSQLite3Database, drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { app } from "electron";
import fs from "fs";
import path from "path";

import { createUserController } from "@/controllers/user.controller";
import * as schema from "./schema";

export const DATABASE_NAME = "codeville-pos.db";

// Database Manager
export class DatabaseManager {
  sqlite: DatabaseT | null;
  db: BetterSQLite3Database<typeof schema> | null;
  dbPath: string | null;

  constructor() {
    this.sqlite = null;
    this.db = null;
    this.dbPath = null;
  }

  async initialize() {
    try {
      // Get the appropriate database path based on environment
      this.dbPath = this.getDatabasePath();

      // Ensure the database directory exists
      this.ensureDirectoryExists(path.dirname(this.dbPath));

      // Initialize SQLite connection
      this.sqlite = new Database(this.dbPath);

      // Enable WAL mode for better performance and concurrency
      this.sqlite.pragma("journal_mode = WAL");
      this.sqlite.pragma("synchronous = NORMAL");
      this.sqlite.pragma("cache_size = 1000000");
      this.sqlite.pragma("foreign_keys = true");
      this.sqlite.pragma("temp_store = memory");

      // Initialize Drizzle ORM
      this.db = drizzle(this.sqlite, { schema });

      // Run migrations if available
      await this.runMigrations();

      await this.initializeUsers();

      console.log(`Database initialized at: ${this.dbPath}`);
      return true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }

  getDatabasePath() {
    let dbDir;

    if (app.isPackaged) {
      // Production: Use app data directory
      dbDir = app.getPath("userData");
    } else {
      // Development: Use current directory (your local setup preference)
      dbDir = process.cwd();
    }

    return path.join(dbDir, DATABASE_NAME);
  }

  ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  getMigrationsPath() {
    if (app.isPackaged) {
      // In packaged app, migrations are bundled in the resources folder
      // The exact path may vary based on your build configuration
      return path.join(process.resourcesPath, "migrations");
    } else {
      // Development mode
      return path.join(process.cwd(), "src", "database", "migrations");
    }
  }

  async runMigrations() {
    try {
      if (!this.db) {
        throw new Error("Database not initialized");
      }

      // Check if migrations directory exists
      const migrationsPath = this.getMigrationsPath();

      if (fs.existsSync(migrationsPath)) {
        console.log("Running database migrations...");

        migrate(this.db, { migrationsFolder: migrationsPath });

        console.log("Migrations completed successfully");
      } else {
        console.log("No migrations found, skipping...");
      }
    } catch (error) {
      console.error("Migration failed:", error);
      throw error;
    }
  }

  async initializeUsers() {
    try {
      // If database is empty, create a default admin user
      if (!this.db) {
        throw new Error("Database not initialized");
      }

      const userCount = await this.db
        .select()
        .from(schema.users)
        .limit(1)
        .then((rows) => rows.length);

      if (userCount === 0) {
        const userCreateRes = await createUserController({
          username: "admin",
          password: "admin123",
          isAdmin: true
        });

        if (userCreateRes.error && !userCreateRes.success)
          throw new Error(userCreateRes.error);

        console.log("Default admin user created");
      }
    } catch (error) {
      console.error("Failed to initialize users: ", error);
    }
  }

  // Get database instance (ensure it's initialized)
  getDB() {
    if (!this.db) {
      throw new Error("Database not initialized. Call initialize() first.");
    }
    return this.db;
  }

  // Close database connection
  close() {
    if (this.sqlite) {
      this.sqlite.close();
      this.sqlite = null;
      this.db = null;
    }
  }
}

// Create singleton instance
const databaseManager = new DatabaseManager();

// Export a function to get the database instance
export function getDB() {
  return databaseManager.getDB();
}

export { databaseManager };
export default databaseManager;
