import { FastifyBaseLogger } from "fastify";
import { WorkspaceService } from "./workspace-service";

/**
 * Executions specific to various lifecycle stages of the Remote service
 */
export class BootstrapService {
    private workspaceService: WorkspaceService;
    private logger: FastifyBaseLogger;

    constructor(workspaceService: WorkspaceService, logger: FastifyBaseLogger) {
        this.workspaceService = workspaceService;
        this.logger = logger;
    }

    async initialize() {
        this.logger.info("Starting BootstrapService initialization...");
        // clone a local copy of CGS-repo
        await this.workspaceService.initialize();
        this.logger.info("BootstrapService initialization complete.");
    }

    async shutdown() {
        this.logger.info("Starting BootstrapService shutdown...");
        // destroy the local copy
        await this.workspaceService.destroy();
        this.logger.info("BootstrapService shutdown complete.");
    }

}