import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import path from "node:path";
import { InitResponseSchema } from "@renaissance/shared";

export async function remoteRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/data/repo/remote/init
    typedApp.post("/init", {
        schema: {
            response: {
                200: InitResponseSchema
            }
        }
    }, async (request, reply) => {
        await request.server.repositoryService.init();
        const cgsPath = path.join(request.server.appPaths.projects, request.server.appPaths.remotePath);
        return {
            repositoryPath: cgsPath,
            createdAt: new Date()
        };
    });
}