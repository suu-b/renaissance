import "fastify";
import { DatabaseSync } from "node:sqlite";

import type { RepositoryService } from "../services/repository/repository-service.js";
import type { VandcService } from "../services/vandc/vandc-service.js";
import type { TokenStorageService } from "../services/token-storage.js";
import type { IndexService } from "../services/index-service.js";

declare module "fastify" {
    interface FastifyInstance {
        repositoryService: RepositoryService;
        vandcService: VandcService;
        tokenStorageService: TokenStorageService;
        indexService: IndexService;
        db: DatabaseSync;
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