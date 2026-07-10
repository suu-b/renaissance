import { SupabaseClient } from "@supabase/supabase-js";
import { FastifyBaseLogger } from "fastify";
import {
    UserObject,
    LoginResponseObject,
    SessionObject,
    SearchUserRequestObject
} from "@renaissance/shared";
import { UserRepositoryService } from "../../user-repository-service.js";

export class SupabaseUserRepository implements UserRepositoryService {
    private supabase: SupabaseClient;
    private logger: FastifyBaseLogger;

    constructor(supabase: SupabaseClient, logger: FastifyBaseLogger) {
        this.supabase = supabase;
        this.logger = logger;
    }

    async register(
        email: string,
        password: string,
        displayName: string,
        username: string
    ): Promise<UserObject> {
        this.logger.info({ email, username, displayName }, "Attempting to register new user");
        const { data: authData, error: authError } = await this.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    display_name: displayName
                }
            }
        });

        if (authError) {
            this.logger.error(
                {
                    email,
                    username,
                    message: authError.message,
                    status: authError.status,
                    code: authError.code,
                    name: authError.name
                },
                "Supabase auth registration failed"
            );

            throw authError;
        }
        if (!authData.user) {
            const err = new Error("Registration failed: User was not created.");
            this.logger.error(err.message);
            throw err;
        }

        const avatarUrl = `https://avatar.vercel.sh/${username}.png`;

        this.logger.info({ userId: authData.user.id }, "Syncing user profile data into database public.users table");
        // Sync into public.users database table
        const { error: dbError } = await this.supabase.from("users").insert({
            id: authData.user.id,
            username,
            display_name: displayName,
            avatar_url: avatarUrl
        });

        if (dbError) {
            this.logger.error({ dbError, userId: authData.user.id }, "Database sync to public.users failed");
            throw dbError;
        }

        this.logger.info({ userId: authData.user.id, username }, "User registration and database sync completed successfully");

        return {
            id: authData.user.id,
            email: authData.user.email ?? email,
            username,
            displayName,
            avatarUrl,
            createdAt: new Date(authData.user.created_at)
        };
    }

    async login(
        email: string,
        password: string
    ): Promise<LoginResponseObject> {
        this.logger.info({ email }, "Attempting user authentication login");
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            this.logger.error(
                {
                    email,
                    message: error.message,
                    status: error.status,
                    code: error.code,
                    name: error.name
                },
                "Supabase authentication login failed"
            );
            throw error;
        }

        const session = data.session;
        if (!data.user || !session) {
            const err = new Error("Login failed: missing user or session data.");
            this.logger.error(err.message);
            throw err;
        }

        this.logger.info({ userId: data.user.id }, "Fetching user profile metadata from public.users table");
        // Fetch DB metadata for profile completeness
        const { data: dbUser, error: dbError } = await this.supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single();

        if (dbError) {
            this.logger.warn({ dbError, userId: data.user.id }, "Failed to fetch user metadata from database. Using auth metadata fallback.");
        }

        const username = dbUser?.username ?? data.user.user_metadata?.username ?? "";
        const displayName = dbUser?.display_name ?? data.user.user_metadata?.display_name ?? "";
        const avatarUrl = dbUser?.avatar_url ?? data.user.user_metadata?.avatar_url ?? `https://avatar.vercel.sh/${username || "user"}.png`;

        this.logger.info({ userId: data.user.id, username }, "User authenticated and profile loaded successfully");

        return {
            user: {
                id: data.user.id,
                email: data.user.email ?? email,
                username,
                displayName,
                avatarUrl,
                createdAt: new Date(dbUser?.created_at ?? data.user.created_at)
            },
            session: {
                accessToken: session.access_token,
                refreshToken: session.refresh_token,
                expiresAt: new Date((session.expires_at ?? 0) * 1000)
            }
        };
    }

    async refresh(
        refreshToken: string
    ): Promise<SessionObject> {
        this.logger.info("Attempting session token refresh");
        const { data, error } = await this.supabase.auth.refreshSession({
            refresh_token: refreshToken
        });

        if (error) {
            this.logger.error({ error }, "Supabase refreshSession failed");
            throw error;
        }

        const session = data.session;
        if (!session) {
            const err = new Error("Session refresh failed: session is missing.");
            this.logger.error(err.message);
            throw err;
        }

        this.logger.info({ userId: data.user?.id }, "Session token refreshed successfully");

        return {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: new Date((session.expires_at ?? 0) * 1000)
        };
    }

    async search(
        query: SearchUserRequestObject
    ): Promise<UserObject[]> {
        this.logger.info({ query }, "Executing search query on users table");
        let queryBuilder = this.supabase
            .from("users")
            .select(query.fields?.length ? query.fields.join(",") : "*");

        if (query.filters) {
            for (const filter of query.filters) {
                const { field, operator, value } = filter;
                switch (operator) {
                    case "eq":
                        queryBuilder = queryBuilder.eq(field, value);
                        break;
                    case "neq":
                        queryBuilder = queryBuilder.neq(field, value);
                        break;
                    case "contains":
                        queryBuilder = queryBuilder.like(field, `%${value}%`);
                        break;
                    case "startsWith":
                        queryBuilder = queryBuilder.like(field, `${value}%`);
                        break;
                    case "endsWith":
                        queryBuilder = queryBuilder.like(field, `%${value}`);
                        break;
                    case "in":
                        queryBuilder = queryBuilder.in(field, value);
                        break;
                    case "gt":
                        queryBuilder = queryBuilder.gt(field, value);
                        break;
                    case "gte":
                        queryBuilder = queryBuilder.gte(field, value);
                        break;
                    case "lt":
                        queryBuilder = queryBuilder.lt(field, value);
                        break;
                    case "lte":
                        queryBuilder = queryBuilder.lte(field, value);
                        break;
                }
            }
        }

        if (query.sort) {
            queryBuilder = queryBuilder.order(query.sort.field, {
                ascending: query.sort.order === "asc"
            });
        } else {
            queryBuilder = queryBuilder.order("username", { ascending: true });
        }

        const from = query.offset ?? 0;
        const to = from + (query.limit ?? 25) - 1;
        queryBuilder = queryBuilder.range(from, to);

        const { data, error } = await queryBuilder;
        if (error) {
            this.logger.error({ error, query }, "Search query on users table failed");
            throw error;
        }

        this.logger.info({ count: data?.length ?? 0 }, "Search query on users table completed successfully");

        return (data || []).map((row: any) => ({
            id: row.id,
            username: row.username,
            displayName: row.display_name,
            avatarUrl: row.avatar_url,
            email: row.email ?? "",
            createdAt: new Date(row.created_at)
        }));
    }

    async findById(
        id: string
    ): Promise<UserObject> {
        this.logger.info({ id }, "Querying user profile by ID");
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            this.logger.error({ error, id }, "Query user profile by ID failed");
            throw error;
        }
        if (!data) {
            const err = new Error(`User with ID ${id} not found.`);
            this.logger.warn({ id }, err.message);
            throw err;
        }

        this.logger.info({ id, username: data.username }, "User profile found by ID");

        return {
            id: data.id,
            username: data.username,
            displayName: data.display_name,
            avatarUrl: data.avatar_url,
            email: data.email ?? "",
            createdAt: new Date(data.created_at)
        };
    }

    async findByUsername(
        username: string
    ): Promise<UserObject> {
        this.logger.info({ username }, "Querying user profile by username");
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .single();

        if (error) {
            this.logger.error({ error, username }, "Query user profile by username failed");
            throw error;
        }
        if (!data) {
            const err = new Error(`User with username ${username} not found.`);
            this.logger.warn({ username }, err.message);
            throw err;
        }

        this.logger.info({ id: data.id, username }, "User profile found by username");

        return {
            id: data.id,
            username: data.username,
            displayName: data.display_name,
            avatarUrl: data.avatar_url,
            email: data.email ?? "",
            createdAt: new Date(data.created_at)
        };
    }
}
