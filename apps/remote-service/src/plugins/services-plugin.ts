import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { WorkspaceService } from "../services/workspace/workspace-service.js";
import { BootstrapService } from "../services/bootstrap/bootstrap-service.js";

export default fp(async (app: FastifyInstance) => {
    const workspaceService = new WorkspaceService(app.log);
    app.decorate("workspaceService", workspaceService);
    app.decorate("bootstrapService", new BootstrapService(workspaceService, app.log));
});
