import "fastify";

import { SupabaseClient, User } from "@supabase/supabase-js";

import { WorkspaceService } from "../services/workspace/workspace-service.js";
import { BootstrapService } from "../services/bootstrap/bootstrap-service.js";
import { UserRepositoryService } from "../services/repository/user-repository-service.js";
import { ProjectRepositoryService } from "../services/repository/project-repository-service.js";
import { StoreService } from "../services/store/store-service.js";

declare module "fastify" {
    interface FastifyInstance {
        supabase: SupabaseClient;
        userRepositoryService: UserRepositoryService;
        projectRepositoryService: ProjectRepositoryService;
        workspaceService: WorkspaceService;
        bootstrapService: BootstrapService;
        lockService: LockService;
        storeService: StoreService;
        authenticate: (
            request: import("fastify").FastifyRequest,
            reply: import("fastify").FastifyReply
        ) => Promise<void>;
    }

    interface FastifyRequest {
        user?: User;
    }
}