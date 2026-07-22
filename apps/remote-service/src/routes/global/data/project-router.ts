import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { GlobalSearchProjectRequestSchema } from "@renaissance/shared";
import { z } from "zod";

export async function globalProjectRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/global/data/project/search
    typedApp.post("/search", {
        schema: {
            body: GlobalSearchProjectRequestSchema
        },
        preHandler: app.authenticate
    }, async (request, reply) => {
        try {
            request.log.info({ query: request.body }, "Global project search API triggered");
            const userId = request.user!.id;
            const projects = await app.projectRepository.searchGlobalProjects(userId, request.body);
            request.log.info({ count: projects.length }, "Global project search API completed successfully");
            return reply.status(200).send({
                success: true,
                data: projects
            });
        } catch (err: any) {
            request.log.error({ err }, "Global project search API failed");
            return reply.status(400).send({
                success: false,
                error: {
                    code: "SEARCH_FAILED",
                    message: err.message || "Project search failed."
                }
            });
        }
    });

    // GET /api/v1/global/data/project/{id}
    typedApp.get("/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid()
            })
        },
        preHandler: app.authenticate
    }, async (request, reply) => {
        const { id } = request.params;
        try {
            request.log.info({ id }, "Global get project by ID API triggered");
            const userId = request.user!.id;
            const project = await app.projectRepository.findById(id, userId);
            request.log.info({ id, name: project.name }, "Global get project by ID API completed successfully");
            return reply.status(200).send({
                success: true,
                data: project
            });
        } catch (err: any) {
            request.log.error({ err, id }, "Global get project by ID API failed");
            const isForbidden = err.message.includes("Access denied");
            return reply.status(isForbidden ? 403 : 404).send({
                success: false,
                error: {
                    code: isForbidden ? "ACCESS_DENIED" : "PROJECT_NOT_FOUND",
                    message: err.message || "Requested project does not exist."
                }
            });
        }
    });
}
