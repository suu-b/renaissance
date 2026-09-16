import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "crypto";
import { ProjectObject, UserObject, ChapterObject } from "@renaissance/shared";

export interface CreateProjectParams {
    id?: string;
    name: string;
    description: string;
    isPrivate: boolean;
    path: string;
    owner: UserObject;
    defaultBranch?: string | null;
}

export interface CreateChapterParams {
    id?: string;
    projectId: string;
    name: string;
    branchId?: string;
}

export interface CreateBranchParams {
    id?: string;
    projectId: string;
    branchName: string;
}

export interface SearchProjectsParams {
    includePrivate?: boolean;
    ownerId?: string;
    contributorIds?: string[];
}


export class IndexService {
    constructor(private db: DatabaseSync) {}

    createProject(params: CreateProjectParams): string {
        const id = params.id || randomUUID();
        const now = new Date().toISOString();
        const defaultBranch = params.defaultBranch || null;

        const stmt = this.db.prepare(`
            INSERT INTO projects (id, name, description, is_private, path, created_at, updated_at, owner_id, owner_data, default_branch)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
            id,
            params.name,
            params.description,
            params.isPrivate ? 1 : 0,
            params.path,
            now,
            now,
            params.owner.id,
            JSON.stringify(params.owner),
            defaultBranch
        );

        return id;
    }

    getProjectById(id: string): ProjectObject | null {
        const stmt = this.db.prepare(`
            SELECT p.*, 
                   GROUP_CONCAT(pc.user_id) as contributor_ids
            FROM projects p
            LEFT JOIN project_contributors pc ON p.id = pc.project_id
            WHERE p.id = ?
            GROUP BY p.id
        `);

        const row = stmt.get(id) as any;
        if (!row) return null;

        return this.mapRowToProject(row);
    }

    getAllProjects(params?: SearchProjectsParams): ProjectObject[] {
        let query = `
            SELECT p.*, 
                   GROUP_CONCAT(pc.user_id) as contributor_ids
            FROM projects p
            LEFT JOIN project_contributors pc ON p.id = pc.project_id
        `;

        const conditions: string[] = [];
        const values: any[] = [];

        if (params?.ownerId && params?.contributorIds && params.contributorIds.length > 0) {
            // User is owner OR contributor
            const contributorPlaceholders = params.contributorIds.map(() => "?").join(",");
            conditions.push(`(p.owner_id = ? OR pc.user_id IN (${contributorPlaceholders}))`);
            values.push(params.ownerId, ...params.contributorIds);
        } else if (params?.ownerId) {
            conditions.push("p.owner_id = ?");
            values.push(params.ownerId);
        } else if (params?.contributorIds && params.contributorIds.length > 0) {
            const contributorPlaceholders = params.contributorIds.map(() => "?").join(",");
            conditions.push(`pc.user_id IN (${contributorPlaceholders})`);
            values.push(...params.contributorIds);
        }

        if (conditions.length > 0) {
            query += " WHERE " + conditions.join(" OR ");
        }

        query += " GROUP BY p.id";

        const stmt = this.db.prepare(query);
        const rows = stmt.all(...values) as any[];

        let projects = rows.map(row => this.mapRowToProject(row));

        if (params?.includePrivate === false) {
            projects = projects.filter(p => !p.isPrivate);
        }

        return projects;
    }

    updateProject(id: string, updates: Partial<Pick<ProjectObject, 'name' | 'description' | 'isPrivate'>>): boolean {
        const now = new Date().toISOString();
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.name !== undefined) {
            fields.push("name = ?");
            values.push(updates.name);
        }

        if (updates.description !== undefined) {
            fields.push("description = ?");
            values.push(updates.description);
        }

        if (updates.isPrivate !== undefined) {
            fields.push("is_private = ?");
            values.push(updates.isPrivate ? 1 : 0);
        }

        if (fields.length === 0) return false;

        fields.push("updated_at = ?");
        values.push(now);
        values.push(id);

        const stmt = this.db.prepare(`
            UPDATE projects SET ${fields.join(", ")} WHERE id = ?
        `);

        const result = stmt.run(...values);
        return result.changes > 0;
    }

    updateProjectName(id: string, name: string): boolean {
        return this.updateProject(id, { name });
    }

    updateProjectDescription(id: string, description: string): boolean {
        return this.updateProject(id, { description });
    }

    updateProjectPrivacy(id: string, isPrivate: boolean): boolean {
        return this.updateProject(id, { isPrivate });
    }

    updateProjectDefaultBranch(id: string, defaultBranch: string): boolean {
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
            UPDATE projects SET default_branch = ?, updated_at = ? WHERE id = ?
        `);

        const result = stmt.run(defaultBranch, now, id);
        return result.changes > 0;
    }

    updateProjectPath(id: string, path: string): boolean {
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
            UPDATE projects SET path = ?, updated_at = ? WHERE id = ?
        `);

        const result = stmt.run(path, now, id);
        return result.changes > 0;
    }

    updateProjectOwner(id: string, owner: UserObject): boolean {
        const now = new Date().toISOString();
        const stmt = this.db.prepare(`
            UPDATE projects SET owner_id = ?, owner_data = ?, updated_at = ? WHERE id = ?
        `);

        const result = stmt.run(owner.id, JSON.stringify(owner), now, id);
        return result.changes > 0;
    }

    deleteProject(id: string): boolean {
        const stmt = this.db.prepare("DELETE FROM projects WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }

    addContributor(projectId: string, userId: string): boolean {
        const id = randomUUID();
        const now = new Date().toISOString();

        const stmt = this.db.prepare(`
            INSERT INTO project_contributors (id, project_id, user_id, created_at)
            VALUES (?, ?, ?, ?)
        `);

        try {
            stmt.run(id, projectId, userId, now);
            return true;
        } catch (error) {
            return false;
        }
    }

    removeContributor(projectId: string, userId: string): boolean {
        const stmt = this.db.prepare(`
            DELETE FROM project_contributors WHERE project_id = ? AND user_id = ?
        `);

        const result = stmt.run(projectId, userId);
        return result.changes > 0;
    }

    private mapRowToProject(row: any): ProjectObject {
        const owner: UserObject = JSON.parse(row.owner_data);
        const contributorIds = row.contributor_ids ? row.contributor_ids.split(",") : [];

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            isPrivate: row.is_private === 1,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            owner: {
                ...owner,
                createdAt: new Date(owner.createdAt)
            },
            contributors: contributorIds.map((id: string) => ({
                id,
                username: "",
                displayName: "",
                avatarUrl: "",
                email: "",
                createdAt: new Date()
            })),
            defaultBranch: row.default_branch || null
        } as any;
    }

    createChapter(params: CreateChapterParams): string {
        const id = params.id || randomUUID();
        const now = new Date().toISOString();

        const stmt = this.db.prepare(`
            INSERT INTO chapters (id, project_id, name, created_at, updated_at, branch_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        stmt.run(id, params.projectId, params.name, now, now, params.branchId || null);

        return id;
    }

    getChapterById(id: string): ChapterObject | null {
        const stmt = this.db.prepare(`
            SELECT * FROM chapters WHERE id = ?
        `);

        const row = stmt.get(id) as any;
        if (!row) return null;

        return this.mapRowToChapter(row);
    }

    getChaptersByProjectId(projectId: string): ChapterObject[] {
        const stmt = this.db.prepare(`
            SELECT * FROM chapters WHERE project_id = ?
        `);

        const rows = stmt.all(projectId) as any[];
        return rows.map(row => this.mapRowToChapter(row));
    }

    updateChapter(id: string, name: string): boolean {
        const now = new Date().toISOString();

        const stmt = this.db.prepare(`
            UPDATE chapters SET name = ?, updated_at = ? WHERE id = ?
        `);

        const result = stmt.run(name, now, id);
        return result.changes > 0;
    }

    deleteChapter(id: string): boolean {
        const stmt = this.db.prepare("DELETE FROM chapters WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }

    private mapRowToChapter(row: any): ChapterObject {
        return {
            id: row.id,
            project: row.project_id,
            name: row.name,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            branchId: row.branch_id
        };
    }

    createBranch(params: CreateBranchParams): string {
        const id = params.id || randomUUID();
        const now = new Date().toISOString();

        const stmt = this.db.prepare(`
            INSERT INTO branches (id, branch_name, project_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `);

        stmt.run(id, params.branchName, params.projectId, now, now);

        return id;
    }

    getBranchById(id: string): any | null {
        const stmt = this.db.prepare(`
            SELECT * FROM branches WHERE id = ?
        `);

        const row = stmt.get(id) as any;
        if (!row) return null;

        return {
            id: row.id,
            branchName: row.branch_name,
            projectId: row.project_id,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }

    getBranchesByProjectId(projectId: string): any[] {
        const stmt = this.db.prepare(`
            SELECT * FROM branches WHERE project_id = ?
        `);

        const rows = stmt.all(projectId) as any[];
        return rows.map(row => ({
            id: row.id,
            branchName: row.branch_name,
            projectId: row.project_id,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        }));
    }

    getBranchByName(projectId: string, branchName: string): any | null {
        const stmt = this.db.prepare(`
            SELECT * FROM branches WHERE project_id = ? AND branch_name = ?
        `);

        const row = stmt.get(projectId, branchName) as any;
        if (!row) return null;

        return {
            id: row.id,
            branchName: row.branch_name,
            projectId: row.project_id,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at)
        };
    }

    deleteBranch(id: string): boolean {
        const stmt = this.db.prepare("DELETE FROM branches WHERE id = ?");
        const result = stmt.run(id);
        return result.changes > 0;
    }
}