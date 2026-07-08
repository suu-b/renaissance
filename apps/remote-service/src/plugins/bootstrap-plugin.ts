import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";

import { BootstrapService } from "../services/bootstrap-service.js";

export default fp(async (app: FastifyInstance) => {
    app.decorate("bootstrapService", new BootstrapService(app.workspaceService, app.log));
});