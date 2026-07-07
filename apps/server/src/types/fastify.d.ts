import "fastify";

import type { RepositoryService } from "../services/repository/repository-service.js";
import type { VandcService } from "../services/vandc/vandc-service.js";

declare module "fastify" {
    interface FastifyInstance {
        repositoryService: RepositoryService;
        vandcService: VandcService;
        appPaths: {
            projects: string;
            remoteUrl: string;
            remotePath: string;
        };
    }
}