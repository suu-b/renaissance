import "fastify";

import type { RepositoryService } from "../services/repository/repository-service.js";
import type { VandcService } from "../services/vandc/vandc-service.js";
import type { TokenStorageService } from "../services/token-storage.js";

declare module "fastify" {
    interface FastifyInstance {
        repositoryService: RepositoryService;
        vandcService: VandcService;
        tokenStorageService: TokenStorageService;
        appPaths: {
            projects: string;
            remoteUrl: string;
            remotePath: string;
            renaissancePath: string;
            workspacePath: string;
            indexFilePath: string;
        };
    }
}