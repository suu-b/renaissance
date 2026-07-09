import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { SearchUserRequestSchema } from "@renaissance/shared";
import { z } from "zod";

export async function globalUserRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/global/data/user/search
    typedApp.post("/search", {
        schema: {
            body: SearchUserRequestSchema
        }
    }, async (request, reply) => {
        try {
            request.log.info({ query: request.body }, "Global user search API triggered");
            const users = await app.userRepository.search(request.body);
            request.log.info({ count: users.length }, "Global user search API completed successfully");
            return reply.status(200).send({
                success: true,
                data: users
            });
        } catch (err: any) {
            request.log.error({ err }, "Global user search API failed");
            return reply.status(400).send({
                success: false,
                error: {
                    code: "SEARCH_FAILED",
                    message: err.message || "User search failed."
                }
            });
        }
    });

    // GET /api/v1/global/data/user/{id}
    typedApp.get("/:id", {
        schema: {
            params: z.object({
                id: z.string().uuid()
            })
        }
    }, async (request, reply) => {
        const { id } = request.params;
        try {
            request.log.info({ id }, "Global get user by ID API triggered");
            const user = await app.userRepository.findById(id);
            request.log.info({ id, username: user.username }, "Global get user by ID API completed successfully");
            return reply.status(200).send({
                success: true,
                data: user
            });
        } catch (err: any) {
            request.log.error({ err, id }, "Global get user by ID API failed");
            return reply.status(404).send({
                success: false,
                error: {
                    code: "USER_NOT_FOUND",
                    message: err.message || "Requested user does not exist."
                }
            });
        }
    });

    // GET /api/v1/global/data/user/by-username/{username}
    typedApp.get("/by-username/:username", {
        schema: {
            params: z.object({
                username: z.string().min(1)
            })
        }
    }, async (request, reply) => {
        const { username } = request.params;
        try {
            request.log.info({ username }, "Global get user by username API triggered");
            const user = await app.userRepository.findByUsername(username);
            request.log.info({ username, id: user.id }, "Global get user by username API completed successfully");
            return reply.status(200).send({
                success: true,
                data: user
            });
        } catch (err: any) {
            request.log.error({ err, username }, "Global get user by username API failed");
            return reply.status(404).send({
                success: false,
                error: {
                    code: "USER_NOT_FOUND",
                    message: err.message || "Requested user does not exist."
                }
            });
        }
    });
}
