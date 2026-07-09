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
            const users = await app.userRepository.search(request.body);
            return reply.status(200).send({
                success: true,
                data: users
            });
        } catch (err: any) {
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
        try {
            const { id } = request.params;
            const user = await app.userRepository.findById(id);
            return reply.status(200).send({
                success: true,
                data: user
            });
        } catch (err: any) {
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
        try {
            const { username } = request.params;
            const user = await app.userRepository.findByUsername(username);
            return reply.status(200).send({
                success: true,
                data: user
            });
        } catch (err: any) {
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
