import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { InitResponseSchema } from "@renaissance/shared";

export async function localRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/repo/local/init
    typedApp.post("/init", {
        schema: {
            response: {
                200: InitResponseSchema
            }
        }
    }, async (request, reply) => {
        await request.server.vandcService.init()
        return {
            repositoryPath: request.server.appPaths.projects,
            createdAt: new Date()
        };
    });
}