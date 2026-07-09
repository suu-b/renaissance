import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { SearchProjectRequestSchema, CreateProjectRequestSchema } from "@renaissance/shared";

export async function projectRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/project/search
    typedApp.post("/search", {
        schema: {
            body: SearchProjectRequestSchema
        }
    }, async (request, reply) => {
        return reply.status(200).send({
            success: true,
            data: []
        });
    });

    // POST /api/v1/user/data/project/new
    typedApp.post("/new", {
        schema: {
            body: CreateProjectRequestSchema
        }
    }, async (request, reply) => {
        return reply.status(201).send({
            success: true,
            data: null
        });
    });
}
