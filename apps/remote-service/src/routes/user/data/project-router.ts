import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { SearchProjectRequestSchema, CreateProjectRequestSchema, PublishProjectRequestSchema, CARObjectSchema, sendSuccess, Errors, sendError, CARResponses } from "@renaissance/shared";

export async function projectRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/project/search
    typedApp.post("/search", {
        schema: {
            body: SearchProjectRequestSchema,
            response: CARResponses
        },
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            request.log.info({ query: request.body }, "User scoped project search API triggered");
            const userId = request.user!.id;
            const projects = await app.projectRepositoryService.searchUserProjects(userId, request.body);
            request.log.info({ count: projects.length }, "User scoped project search API completed successfully");
            return reply.status(200).send(sendSuccess(projects));
        } catch (err: any) {
            request.log.error({ err }, "User scoped project search API failed");
            return reply.status(400).send(sendError(Errors.PROJECTS_SEARCH_FAILED));
        }
    });

    // POST /api/v1/user/data/project/new 
    typedApp.post("/new", {
        schema: {
            body: CreateProjectRequestSchema,
            response: CARResponses
        },
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            request.log.info({ body: request.body }, "Create project API triggered");
            const userId = request.user!.id;
            const dbUser = await app.userRepositoryService.findById(userId);

            if (!dbUser) {
                return reply.status(404).send(sendError(Errors.USER_NOT_FOUND));
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
            return reply.status(201).send(sendSuccess(project));
        } catch (err: any) {
            request.log.error({ err }, "Create project API failed");
            return reply.status(400).send(sendError(Errors.PROJECT_CREATE_FAILED));
        }
    });

    // POST /api/v1/user/data/project/publish
    typedApp.post("/publish", {
        schema: {
            body: PublishProjectRequestSchema,
            response: CARResponses
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
                return reply.status(403).send(sendError(Errors.PROJECT_PUBLISH_FORBIDDEN));
            }

            await app.lockService.withLock(async () => {
                await app.workspaceService.applyPatch(patchContent)
                await app.workspaceService.stage(`${username}/${projectId}`)
                await app.workspaceService.commit(`Sync: ${userId}`)
                await app.storeService.publish()
            });
            request.log.info("Publish project API completed successfully");
            return reply.status(200).send(sendSuccess({}));
        } catch (err: any) {
            request.log.error({ err }, "Publish project API failed");
            return reply.status(500).send(sendError(Errors.PROJECT_PUBLISH_FAILED));
        }
    });
}
