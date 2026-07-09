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
        }
    }, async (request, reply) => {
        return reply.status(200).send({
            success: true,
            data: []
        });
    });

    // GET /api/v1/global/data/project/{id}
    typedApp.get("/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid()
            })
        }
    }, async (request, reply) => {
        return reply.status(200).send({
            success: true,
            data: null
        });
    });
}
