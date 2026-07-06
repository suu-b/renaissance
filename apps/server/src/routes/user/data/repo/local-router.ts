import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { InitResponseSchema } from "@renaissance/shared";

export async function localRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/repo/init/local
    typedApp.post("/local", {
        schema: {
            response: {
                200: InitResponseSchema
            }
        }
    }, async (request, reply) => {
        return {
            repositoryPath: "/mock/path/local",
            createdAt: new Date()
        };
    });
}