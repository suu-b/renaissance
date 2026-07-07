import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import path from "node:path";

// Interfaces
import type { RepositoryService } from "../services/repository/repository-service.js";
import type { VandcService } from "../services/vandc/vandc-service.js";

// Providers
import { GitHubProvider } from "../services/repository/providers/github.js";
import { GitProvider } from "../services/vandc/providers/git.js";

export default fp(async (app: FastifyInstance) => {
    const cgsPath = path.join(app.appPaths.projects, app.appPaths.remotePath);
    app.decorate<RepositoryService>("repositoryService", new GitHubProvider(cgsPath, app.appPaths.remoteUrl));
    app.decorate<VandcService>("vandcService", new GitProvider(app.appPaths.projects));
});