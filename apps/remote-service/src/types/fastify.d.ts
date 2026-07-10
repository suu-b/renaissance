import "fastify";

import { WorkspaceService } from "../services/workspace/workspace-service.js";
import { BootstrapService } from "../services/bootstrap/bootstrap-service.js";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { UserRepositoryService } from "../services/repository/user-repository-service.js";
import { ProjectRepositoryService } from "../services/repository/project-repository-service.js";

declare module "fastify" {
    interface FastifyInstance {
        workspaceService: WorkspaceService;
        bootstrapService: BootstrapService;
        supabase: SupabaseClient;
        userRepository: UserRepositoryService;
        projectRepository: ProjectRepositoryService;
        authenticate: (
            request: import("fastify").FastifyRequest,
            reply: import("fastify").FastifyReply
        ) => Promise<void>;
    }

    interface FastifyRequest {
        user?: User;
    }
}