import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";

import { WorkspaceService } from "../services/workspace-service.js";

export default fp(async (app: FastifyInstance) => {
    app.decorate("workspaceService", new WorkspaceService(app.log));
});