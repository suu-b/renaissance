import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "node:fs";

export default class MigrationRunner {
  private db: DatabaseSync;
  private migrationsPath: string;

  constructor(db: DatabaseSync, migrationsPath: string = "./migrations") {
    this.db = db;
    this.migrationsPath = migrationsPath;
  }

  public run() {
    this.db.exec(`
        CREATE TABLE IF NOT EXISTS migrations (
            id integer primary key autoincrement,
            name text not null unique,
            applied_at text not null default current_timestamp
        )
        `);
    const migrations = fs
      .readdirSync(this.migrationsPath)
      .filter((file) => file.endsWith(".sql"))
      .sort();
    for (const migration of migrations) {
      const alreadyApplied = this.db
        .prepare("SELECT name FROM migrations WHERE name = ?")
        .get(migration);

      if (alreadyApplied) {
        console.log(`Migration already applied: ${migration}`);
        return;
      }
      const migrationPath = path.join(this.migrationsPath, migration);
      const sql = fs.readFileSync(migrationPath, "utf-8");
      console.log(`Applying migration: ${migration}`);
      this.db.exec("BEGIN TRANSACTION");
      try {
        this.db.exec(sql);
        this.db
          .prepare("INSERT INTO migrations (name) VALUES (?)")
          .run(migration);
        this.db.exec("COMMIT");
        console.log(`Migration applied: ${migration}`);
      } catch (error) {
        this.db.exec("ROLLBACK");
        throw new Error(`Migration failed: ${migration}`, {
          cause: error,
        });
      }
    }
  }
}
