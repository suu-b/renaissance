// Migrations contains the SQL code to setup the renaissance database
// inside user's machine
import { DatabaseSync } from "node:sqlite";
export function runMigrations(db: DatabaseSync) {
    db.exec(`
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            is_private INTEGER NOT NULL DEFAULT 0,
            path TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            owner_id TEXT NOT NULL,
            owner_data TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS project_contributors (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            user_id TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
            UNIQUE(project_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS chapters (
            id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            name TEXT NOT NULL,
            chapter_number INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON projects(owner_id);
        CREATE INDEX IF NOT EXISTS idx_project_contributors_project_id ON project_contributors(project_id);
        CREATE INDEX IF NOT EXISTS idx_project_contributors_user_id ON project_contributors(user_id);
        CREATE INDEX IF NOT EXISTS idx_chapters_project_id ON chapters(project_id);
    `);
}
