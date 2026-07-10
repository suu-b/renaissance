import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default fp(async (app: FastifyInstance) => {
    app.log.info("Initializing authentication plugin...");

    const authenticate = async (request: FastifyRequest, reply: FastifyReply) => {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            reply.status(401).send({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Missing or invalid authorization header. Expected 'Bearer <access_token>'."
                }
            });
            throw new Error("Unauthorized");
        }

        const token = authHeader.substring(7).trim();
        try {
            const { data: { user }, error } = await app.supabase.auth.getUser(token);
            if (error || !user) {
                reply.status(401).send({
                    success: false,
                    error: {
                        code: "UNAUTHORIZED",
                        message: error?.message || "Invalid or expired access token."
                    }
                });
                throw new Error("Unauthorized");
            }
            request.user = user;
        } catch (err: any) {
            if (err.message === "Unauthorized") {
                throw err;
            }
            app.log.error({ err }, "Supabase auth validation failed");
            reply.status(401).send({
                success: false,
                error: {
                    code: "UNAUTHORIZED",
                    message: "Authentication validation failed."
                }
            });
            throw err;
        }
    };

    app.decorate("authenticate", authenticate);
    app.log.info("Authentication plugin registered successfully.");
});
