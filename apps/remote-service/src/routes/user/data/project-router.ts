import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { SearchProjectRequestSchema, CreateProjectRequestSchema, PublishProjectRequestSchema } from "@renaissance/shared";

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

            if (!dbUser) {
                return reply.status(404).send({
                    success: false,
                    error: {
                        code: "USER_NOT_FOUND",
                        message: "Authenticated user profile was not found."
                    }
                });
            }

            const username = dbUser.username;
            const project = await app.lockService.withLock(async () => {
                const project = await app.projectRepositoryService.create(
                    userId,
                    dbUser.username,
                    request.body
                );
                const patch = [
                    `diff --git a/${username}/${project.id}/README.md b/${username}/${project.id}/README.md`,
                    "new file mode 100644",
                    "index 0000000..e69de29",
                    "--- /dev/null",
                    `+++ b/${username}/${project.id}/README.md`,
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

    // POST /api/v1/user/data/project/publish
    typedApp.post("/publish", {
        schema: {
            body: PublishProjectRequestSchema
        },
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            request.log.info({ body: request.body }, "Publish project API triggered");
            const userId = request.user!.id
            const dbUser = await app.userRepositoryService.findById(userId);
            const username = dbUser.username;
            const projectId = request.body.id
            const patchContent = request.body.patchContent

            const canMakeChanges = await app.projectRepositoryService.canMakeChanges(userId, username, projectId)
            if (!canMakeChanges) {
                return reply.status(403).send({
                    success: false,
                    error: {
                        code: "PUBLISH_FAILED",
                        message: "You do not have permission to make changes to this project."
                    }
                });
            }

            await app.lockService.withLock(async () => {
                await app.workspaceService.applyPatch(patchContent)
                await app.workspaceService.stage(`${username}/${projectId}`)
                await app.workspaceService.commit(`Sync: ${userId}`)
                await app.storeService.publish()
            });
            request.log.info("Publish project API completed successfully");
            return reply.status(200).send({
                success: true,
            });
        } catch (err: any) {
            request.log.error({ err }, "Publish project API failed");
            return reply.status(400).send({
                success: false,
                error: {
                    code: "PUBLISH_FAILED",
                    message: err.message || "Failed to publish project."
                }
            });
        }
    });
}
