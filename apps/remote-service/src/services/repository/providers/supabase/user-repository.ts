import { createHash } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";
import {
    UserObject,
    LoginResponseObject,
    SessionObject,
    SearchUserRequestObject
} from "@renaissance/shared";
import { UserRepositoryService } from "../../user-repository-service.js";

export class SupabaseUserRepository implements UserRepositoryService {
    private supabase: SupabaseClient;

    constructor(supabase: SupabaseClient) {
        this.supabase = supabase;
    }

    async register(
        email: string,
        password: string,
        displayName: string,
        username: string
    ): Promise<UserObject> {
        const hashedPassword = this.hashPassword(password);
        const { data: authData, error: authError } = await this.supabase.auth.signUp({
            email,
            password: hashedPassword,
            options: {
                data: {
                    username,
                    display_name: displayName
                }
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Registration failed: User was not created.");

        const avatarUrl = `https://avatar.vercel.sh/${username}.png`;

        // Sync into public.users database table
        const { error: dbError } = await this.supabase.from("users").insert({
            id: authData.user.id,
            username,
            display_name: displayName,
            avatar_url: avatarUrl
        });

        if (dbError) throw dbError;

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
        const hashedPassword = this.hashPassword(password);
        const { data, error } = await this.supabase.auth.signInWithPassword({
            email,
            password: hashedPassword
        });

        if (error) throw error;
        
        const session = data.session;
        if (!data.user || !session) throw new Error("Login failed: missing user or session data.");

        // Fetch DB metadata for profile completeness
        const { data: dbUser } = await this.supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single();

        const username = dbUser?.username ?? data.user.user_metadata?.username ?? "";
        const displayName = dbUser?.display_name ?? data.user.user_metadata?.display_name ?? "";
        const avatarUrl = dbUser?.avatar_url ?? data.user.user_metadata?.avatar_url ?? `https://avatar.vercel.sh/${username || "user"}.png`;

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
        const { data, error } = await this.supabase.auth.refreshSession({
            refresh_token: refreshToken
        });

        if (error) throw error;
        
        const session = data.session;
        if (!session) throw new Error("Session refresh failed: session is missing.");

        return {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: new Date((session.expires_at ?? 0) * 1000)
        };
    }

    async search(
        query: SearchUserRequestObject
    ): Promise<UserObject[]> {
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
        if (error) throw error;

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
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;
        if (!data) throw new Error(`User with ID ${id} not found.`);

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
        const { data, error } = await this.supabase
            .from("users")
            .select("*")
            .eq("username", username)
            .single();

        if (error) throw error;
        if (!data) throw new Error(`User with username ${username} not found.`);

        return {
            id: data.id,
            username: data.username,
            displayName: data.display_name,
            avatarUrl: data.avatar_url,
            email: data.email ?? "",
            createdAt: new Date(data.created_at)
        };
    }

    private hashPassword(password: string): string {
        return createHash("sha256").update(password).digest("hex");
    }
}
