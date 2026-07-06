import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { InitResponseSchema } from "@renaissance/shared";

export async function remoteRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/repo/init/remote
    typedApp.post("/remote", {
        schema: {
            response: {
                200: InitResponseSchema
            }
        }
    }, async (request, reply) => {
        return {
            repositoryPath: "/mock/path/remote",
            createdAt: new Date()
        };
    });
}