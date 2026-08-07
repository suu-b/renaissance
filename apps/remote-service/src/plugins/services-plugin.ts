import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import * as os from "os";
import * as path from "path";
import { randomUUID } from "crypto";

// Services
import { WorkspaceService } from "../services/workspace/workspace-service.js";
import { BootstrapService } from "../services/bootstrap/bootstrap-service.js";
import { UserRepositoryService } from "../services/repository/user-repository-service.js";
import { SupabaseUserRepository } from "../services/repository/providers/supabase/user-repository.js";
import { ProjectRepositoryService } from "../services/repository/project-repository-service.js";
import { SupabaseProjectRepository } from "../services/repository/providers/supabase/project-repository.js";
import { InMemoryLockService } from "../services/lock/providers/in-memory-lock-service.js";
import { GitHubStoreService } from "../services/store/providers/git-store-service.js";

export default fp(async (app: FastifyInstance) => {
    app.log.info("Initializing services plugin...");

    const sessionId = randomUUID();

    const workspace = {
        path: path.join(
            os.tmpdir(),
            "workspace",
            sessionId,
            "cgs"
        )
    };

    app.decorate("workspace", workspace);

    const userRepository: UserRepositoryService = new SupabaseUserRepository(
        app.supabase,
        app.log
    );
    app.decorate("userRepositoryService", userRepository);
    app.log.info("UserRepository registered successfully.");

    const projectRepository: ProjectRepositoryService =
        new SupabaseProjectRepository(app.supabase, app.log);
    app.decorate("projectRepositoryService", projectRepository);
    app.log.info("ProjectRepository registered successfully.");

    const workspaceService = new WorkspaceService(
        app.log,
        workspace
    );
    app.decorate("workspaceService", workspaceService);

    app.decorate(
        "bootstrapService",
        new BootstrapService(workspaceService, app.log)
    );

    app.decorate(
        "lockService",
        new InMemoryLockService()
    );

    app.decorate(
        "storeService",
        new GitHubStoreService(
            app.log,
            workspace.path
        )
    );
});
