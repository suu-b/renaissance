import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { GlobalSearchProjectRequestSchema, sendError, sendSuccess, Errors, CARResponses } from "@renaissance/shared";
import { z } from "zod";

export async function globalProjectRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/global/data/project/search
    typedApp.post("/search", {
        schema: {
            body: GlobalSearchProjectRequestSchema,
            response: CARResponses,
            tags: ["Global Data"],
        },
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            request.log.info(
                { query: request.body },
                "Global project search API triggered"
            );

            const userId = request.user!.id;

            const projects =
                await app.projectRepositoryService.searchGlobalProjects(
                    userId,
                    request.body
                );

            request.log.info(
                { count: projects.length },
                "Global project search API completed successfully"
            );

            return reply
                .status(200)
                .send(sendSuccess(projects));

        } catch (err: any) {
            request.log.error(
                { err },
                "Global project search API failed"
            );

            return reply
                .status(500)
                .send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });

    // GET /api/v1/global/data/project/{id}
    typedApp.get("/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid()
            }),
            response: CARResponses,
            tags: ["Global Data"],
        },
        preHandler: app.authenticate
    }, async (request, reply) => {
        const { id } = request.params;

        try {
            request.log.info(
                { id },
                "Global get project by ID API triggered"
            );

            const userId = request.user!.id;

            const project =
                await app.projectRepositoryService.findById(id, userId);

            if (!project) {
                return reply
                    .status(404)
                    .send(sendError(Errors.PROJECT_NOT_FOUND));
            }

            request.log.info(
                { id, name: project.name },
                "Global get project by ID API completed successfully"
            );

            return reply
                .status(200)
                .send(sendSuccess(project));

        } catch (err: any) {
            request.log.error(
                { err, id },
                "Global get project by ID API failed"
            );

            if (err.message?.includes("Access denied")) {
                return reply
                    .status(403)
                    .send(sendError(Errors.PROJECT_ACCESS_DENIED));
            }

            return reply
                .status(500)
                .send(sendError(Errors.PROJECT_GET_FAILED));
        }
    });
}