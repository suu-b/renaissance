import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { SearchProjectRequestSchema, CreateProjectRequestSchema } from "@renaissance/shared";

export async function projectRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/project/search
    typedApp.post("/search", {
        schema: {
            body: SearchProjectRequestSchema
        },
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            request.log.info({ query: request.body }, "User scoped project search API triggered");
            const userId = request.user!.id;
            const projects = await app.projectRepositoryService.searchUserProjects(userId, request.body);
            request.log.info({ count: projects.length }, "User scoped project search API completed successfully");
            return reply.status(200).send({
                success: true,
                data: projects
            });
        } catch (err: any) {
            request.log.error({ err }, "User scoped project search API failed");
            return reply.status(400).send({
                success: false,
                error: {
                    code: "SEARCH_FAILED",
                    message: err.message || "Failed to search projects."
                }
            });
        }
    });

    // POST /api/v1/user/data/project/new 
    typedApp.post("/new", {
        schema: {
            body: CreateProjectRequestSchema
        },
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            request.log.info({ body: request.body }, "Create project API triggered");
            const userId = request.user!.id;
            const dbUser = await app.userRepositoryService.findById(userId);
            const project = await app.lockService.withLock(async () => {
                const project = await app.projectRepositoryService.create(
                    userId,
                    dbUser.username,
                    request.body
                );
                const patch = [
                    `diff --git a/${project.id}/README.md b/${project.id}/README.md`,
                    "new file mode 100644",
                    "index 0000000..e69de29",
                    "--- /dev/null",
                    `+++ b/${project.id}/README.md`,
                    "@@ -0,0 +1 @@",
                    "+Project Setup",
                    ""
                ];


                const patchString = patch.join("\n");
                await app.workspaceService.applyPatch(patchString)
                await app.workspaceService.stageAll()
                await app.workspaceService.commit(`Project initialized: ${project.id}`)
                await app.storeService.publish()

                return project;
            });
            request.log.info({ projectId: project.id }, "Create project API completed successfully");
            return reply.status(201).send({
                success: true,
                data: project
            });
        } catch (err: any) {
            request.log.error({ err }, "Create project API failed");
            return reply.status(400).send({
                success: false,
                error: {
                    code: "CREATE_FAILED",
                    message: err.message || "Failed to create project."
                }
            });
        }
    });
}
