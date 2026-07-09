import "fastify";

import { WorkspaceService } from "../services/workspace/workspace-service";
import { BootstrapService } from "../services/bootstrap/bootstrap-service";
import { SupabaseClient } from "@supabase/supabase-js";
import { UserRepositoryService } from "../services/repository/user-repository-service";

declare module "fastify" {
    interface FastifyInstance {
        workspaceService: WorkspaceService;
        bootstrapService: BootstrapService;
        supabase: SupabaseClient;
        userRepository: UserRepositoryService;
    }
}