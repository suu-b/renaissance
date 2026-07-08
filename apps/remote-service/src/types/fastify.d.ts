import "fastify";

import { WorkspaceService } from "../services/workspace-service";
import { BootstrapService } from "../services/bootstrap-service";

declare module "fastify" {
    interface FastifyInstance {
        workspaceService: WorkspaceService;
        bootstrapService: BootstrapService;
    }
}