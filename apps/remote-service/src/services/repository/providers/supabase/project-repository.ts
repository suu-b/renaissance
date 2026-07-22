import { SupabaseClient } from "@supabase/supabase-js";
import { FastifyBaseLogger } from "fastify";
import { randomUUID } from "crypto";
import {
    ProjectObject,
    SearchProjectRequestObject,
    CreateProjectRequestObject,
    GlobalSearchProjectRequestObject
} from "@renaissance/shared";
import { ProjectRepositoryService } from "../../project-repository-service.js";

export class SupabaseProjectRepository implements ProjectRepositoryService {
    private supabase: SupabaseClient;
    private logger: FastifyBaseLogger;

    constructor(supabase: SupabaseClient, logger: FastifyBaseLogger) {
        this.supabase = supabase;
        this.logger = logger;
    }

    private mapProjectRow(row: any): ProjectObject {
        const authors = (row.project_members || [])
            .map((m: any) => {
                const u = m.users;
                if (!u) return null;
                return {
                    id: u.id,
                    username: u.username,
                    displayName: u.display_name,
                    avatarUrl: u.avatar_url,
                    email: `${u.username}@example.com`,
                    createdAt: new Date(u.created_at)
                };
            })
            .filter((author: any): author is any => author !== null);

        return {
            id: row.id,
            name: row.name,
            description: row.description,
            isPrivate: row.is_private,
            createdAt: new Date(row.created_at),
            updatedAt: new Date(row.updated_at),
            authors
        };
    }

    async create(
        userId: string,
        username: string,
        payload: CreateProjectRequestObject
    ): Promise<ProjectObject> {
        this.logger.info({ userId, name: payload.name }, "Attempting to create new project");
        const projectId = randomUUID();

        // 1. Insert project row
        const { error: projectError } = await this.supabase
            .from("projects")
            .insert({
                id: projectId,
                name: payload.name,
                description: payload.description,
                is_private: payload.isPrivate
            });

        if (projectError) {
            this.logger.error({ projectError }, "Supabase project creation failed");
            throw projectError;
        }

        // 2. Insert member row
        const { error: memberError } = await this.supabase
            .from("project_members")
            .insert({
                project_id: projectId,
                user_id: userId,
                role: "owner"
            });

        if (memberError) {
            this.logger.error({ memberError, projectId }, "Supabase project member creation failed");
            // Attempt cleanup
            await this.supabase.from("projects").delete().eq("id", projectId);
            throw memberError;
        }

        // 3. Insert default publish policy row
        const { error: policyError } = await this.supabase
            .from("project_policies")
            .insert({
                project_id: projectId,
                user_id: userId,
                allowed_path_prefix: `${username}/${projectId}`,
                can_publish: true
            });

        if (policyError) {
            this.logger.error({ policyError, projectId }, "Supabase project policy creation failed");
            // Attempt cleanup
            await this.supabase.from("projects").delete().eq("id", projectId);
            throw policyError;
        }

        this.logger.info({ projectId }, "Project and dependencies created successfully");
        return this.findById(projectId, userId);
    }

    async findById(
        id: string,
        userId: string
    ): Promise<ProjectObject> {
        this.logger.info({ id, userId }, "Querying project by ID");
        const { data, error } = await this.supabase
            .from("projects")
            .select(`
                *,
                project_members (
                    role,
                    users (
                        id,
                        username,
                        display_name,
                        avatar_url,
                        created_at
                    )
                )
            `)
            .eq("id", id)
            .single();

        if (error) {
            this.logger.error({ error, id }, "Query project by ID failed");
            throw error;
        }
        if (!data) {
            const err = new Error(`Project with ID ${id} not found.`);
            this.logger.warn({ id }, err.message);
            throw err;
        }

        if (data.is_private) {
            const isMember = (data.project_members || []).some(
                (m: any) => m.users?.id === userId
            );
            if (!isMember) {
                const err = new Error("Access denied: Project is private.");
                this.logger.warn({ id, userId }, err.message);
                throw err;
            }
        }

        return this.mapProjectRow(data);
    }

    async searchUserProjects(
        userId: string,
        query: SearchProjectRequestObject
    ): Promise<ProjectObject[]> {
        this.logger.info({ userId }, "Searching user projects");

        // First find user memberships
        const { data: memberRows, error: memberError } = await this.supabase
            .from("project_members")
            .select("project_id")
            .eq("user_id", userId);

        if (memberError) {
            this.logger.error({ memberError, userId }, "Query project membership failed");
            throw memberError;
        }

        const projectIds = (memberRows || []).map((m: any) => m.project_id);
        if (projectIds.length === 0) {
            return [];
        }

        let queryBuilder = this.supabase
            .from("projects")
            .select(`
                *,
                project_members (
                    role,
                    users (
                        id,
                        username,
                        display_name,
                        avatar_url,
                        created_at
                    )
                )
            `)
            .in("id", projectIds);

        if (query.includePrivate === false) {
            queryBuilder = queryBuilder.eq("is_private", false);
        }

        if (query.filters) {
            for (const filter of query.filters) {
                const { field, operator, value } = filter;
                const dbField = field === "isPrivate" ? "is_private" : field;
                switch (operator) {
                    case "eq":
                        queryBuilder = queryBuilder.eq(dbField, value);
                        break;
                    case "neq":
                        queryBuilder = queryBuilder.neq(dbField, value);
                        break;
                    case "contains":
                        queryBuilder = queryBuilder.like(dbField, `%${value}%`);
                        break;
                    case "startsWith":
                        queryBuilder = queryBuilder.like(dbField, `${value}%`);
                        break;
                    case "endsWith":
                        queryBuilder = queryBuilder.like(dbField, `%${value}`);
                        break;
                    case "in":
                        queryBuilder = queryBuilder.in(dbField, value);
                        break;
                    case "gt":
                        queryBuilder = queryBuilder.gt(dbField, value);
                        break;
                    case "gte":
                        queryBuilder = queryBuilder.gte(dbField, value);
                        break;
                    case "lt":
                        queryBuilder = queryBuilder.lt(dbField, value);
                        break;
                    case "lte":
                        queryBuilder = queryBuilder.lte(dbField, value);
                        break;
                }
            }
        }

        if (query.sort) {
            const dbField = query.sort.field === "isPrivate" ? "is_private" : query.sort.field;
            queryBuilder = queryBuilder.order(dbField, {
                ascending: query.sort.order === "asc"
            });
        } else {
            queryBuilder = queryBuilder.order("name", { ascending: true });
        }

        const from = query.offset ?? 0;
        const to = from + (query.limit ?? 25) - 1;
        queryBuilder = queryBuilder.range(from, to);

        const { data, error } = await queryBuilder;
        if (error) {
            this.logger.error({ error }, "Search user projects failed");
            throw error;
        }

        return (data || []).map((row) => this.mapProjectRow(row));
    }

    async searchGlobalProjects(
        userId: string,
        query: GlobalSearchProjectRequestObject
    ): Promise<ProjectObject[]> {
        this.logger.info({ userId }, "Searching global projects");

        let queryBuilder = this.supabase
            .from("projects")
            .select(`
                *,
                project_members (
                    role,
                    users (
                        id,
                        username,
                        display_name,
                        avatar_url,
                        created_at
                    )
                )
            `);

        if (query.includeUserProjects) {
            // Retrieve project IDs where user is member
            const { data: memberRows } = await this.supabase
                .from("project_members")
                .select("project_id")
                .eq("user_id", userId);

            const userProjectIds = (memberRows || []).map((m: any) => m.project_id);

            if (userProjectIds.length > 0) {
                queryBuilder = queryBuilder.or(`is_private.eq.false,id.in.(${userProjectIds.join(",")})`);
            } else {
                queryBuilder = queryBuilder.eq("is_private", false);
            }
        } else {
            queryBuilder = queryBuilder.eq("is_private", false);
        }

        if (query.filters) {
            for (const filter of query.filters) {
                const { field, operator, value } = filter;
                const dbField = field === "isPrivate" ? "is_private" : field;
                switch (operator) {
                    case "eq":
                        queryBuilder = queryBuilder.eq(dbField, value);
                        break;
                    case "neq":
                        queryBuilder = queryBuilder.neq(dbField, value);
                        break;
                    case "contains":
                        queryBuilder = queryBuilder.like(dbField, `%${value}%`);
                        break;
                    case "startsWith":
                        queryBuilder = queryBuilder.like(dbField, `${value}%`);
                        break;
                    case "endsWith":
                        queryBuilder = queryBuilder.like(dbField, `%${value}`);
                        break;
                    case "in":
                        queryBuilder = queryBuilder.in(dbField, value);
                        break;
                    case "gt":
                        queryBuilder = queryBuilder.gt(dbField, value);
                        break;
                    case "gte":
                        queryBuilder = queryBuilder.gte(dbField, value);
                        break;
                    case "lt":
                        queryBuilder = queryBuilder.lt(dbField, value);
                        break;
                    case "lte":
                        queryBuilder = queryBuilder.lte(dbField, value);
                        break;
                }
            }
        }

        if (query.sort) {
            const dbField = query.sort.field === "isPrivate" ? "is_private" : query.sort.field;
            queryBuilder = queryBuilder.order(dbField, {
                ascending: query.sort.order === "asc"
            });
        } else {
            queryBuilder = queryBuilder.order("name", { ascending: true });
        }

        const from = query.offset ?? 0;
        const to = from + (query.limit ?? 25) - 1;
        queryBuilder = queryBuilder.range(from, to);

        const { data, error } = await queryBuilder;
        if (error) {
            this.logger.error({ error }, "Search global projects failed");
            throw error;
        }

        return (data || []).map((row) => this.mapProjectRow(row));
    }
}
