import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { SearchUserRequestSchema, sendSuccess, sendError, Errors, CARResponses } from "@renaissance/shared";
import { z } from "zod";

export async function globalUserRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/global/data/user/search
    typedApp.post("/search", {
        schema: {
            body: SearchUserRequestSchema,
            response: CARResponses,
            tags: ["Global Data"],
        }
    }, async (request, reply) => {
        try {
            request.log.info({ query: request.body }, "Global user search API triggered");
            const users = await app.userRepositoryService.search(request.body);
            request.log.info({ count: users.length }, "Global user search API completed successfully");
            return reply.status(200).send(sendSuccess(users));
        } catch (err: any) {
            request.log.error({ err }, "Global user search API failed");
            return reply.status(400).send(sendError(Errors.USERS_SEARCH_FAILED));
        }
    });

    // GET /api/v1/global/data/user/{id}
    typedApp.get("/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid()
            }),
            response: CARResponses,
            tags: ["Global Data"],
        }
    }, async (request, reply) => {
        const { id } = request.params;
        try {
            request.log.info({ id }, "Global get user by ID API triggered");
            const user = await app.userRepositoryService.findById(id);
            if (!user) {
                return reply
                    .status(404)
                    .send(sendError(Errors.USER_NOT_FOUND));
            }
            request.log.info(
                { id, username: user.username },
                "Global get user by ID API completed successfully"
            );
            return reply
                .status(200)
                .send(sendSuccess(user));
        } catch (err: any) {
            request.log.error(
                { err, id },
                "Global get user by ID API failed"
            );
            return reply
                .status(500)
                .send(sendError(Errors.USER_GET_FAILED));
        }
    });

    // GET /api/v1/global/data/user/by-username/{username}
    typedApp.get("/by-username/:username", {
        schema: {
            params: z.object({
                username: z.string().min(1),
            }),
            response: CARResponses,
            tags: ["Global Data"],
        }
    }, async (request, reply) => {
        const { username } = request.params;
        try {
            request.log.info(
                { username },
                "Global get user by username API triggered"
            );
            const user = await app.userRepositoryService.findByUsername(username);
            if (!user) {
                return reply
                    .status(404)
                    .send(sendError(Errors.USER_NOT_FOUND));
            }
            request.log.info(
                { username, id: user.id },
                "Global get user by username API completed successfully"
            );
            return reply
                .status(200)
                .send(sendSuccess(user));

        } catch (err: any) {
            request.log.error(
                { err, username },
                "Global get user by username API failed"
            );
            return reply
                .status(500)
                .send(sendError(Errors.USER_GET_FAILED));
        }
    });
}
