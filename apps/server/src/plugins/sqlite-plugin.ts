import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import envPaths from "env-paths";
import { runMigrations } from "../db/migrations.js";

// this will cretae a sqlite db plugin 
// for local indexing layer
export default fp(async (app: FastifyInstance) => {
    app.log.info("Initializing SQLite database...");

    const paths = envPaths("renaissance");
    const dataDir = paths.data;
    fs.mkdirSync(dataDir, { recursive: true });

    const dbPath = path.join(dataDir, "renaissance.db");
    const db = new DatabaseSync(dbPath);
    db.exec(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
    `);

    runMigrations(db);

    app.decorate("db", db);
    // app.decorate("dbPath", dbPath); // if required, then uncomment
    app.addHook("onClose", () => {
        db.close();
        app.log.info("SQLite database closed.");
    });
    app.log.info( { dbPath }, "SQLite database initialized successfully"
    );
});