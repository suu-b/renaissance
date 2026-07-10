import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
    RegisterUserRequestSchema,
    LoginRequestSchema,
    RefreshSessionRequestSchema
} from "@renaissance/shared";

export async function authRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/auth/register
    typedApp.post("/register", {
        schema: {
            body: RegisterUserRequestSchema
        }
    }, async (request, reply) => {
        const { email, password, displayName, username } = request.body;
        try {
            request.log.info({ email, username, displayName }, "User registration API triggered");
            const user = await app.userRepository.register(email, password, displayName, username);
            request.log.info({ userId: user.id, username }, "User registration API completed successfully");
            return reply.status(201).send({
                success: true,
                data: user
            });
        } catch (err: any) {
            request.log.error({ err, email, username }, "User registration API failed");
            return reply.status(400).send({
                success: false,
                error: {
                    code: "REGISTRATION_FAILED",
                    message: err.message || "Failed to register user."
                }
            });
        }
    });

    // POST /api/v1/user/auth/login
    typedApp.post("/login", {
        schema: {
            body: LoginRequestSchema
        }
    }, async (request, reply) => {
        const { email, password } = request.body;
        try {
            request.log.info({ email }, "User login API triggered");
            const loginResult = await app.userRepository.login(email, password);
            request.log.info({ userId: loginResult.user.id }, "User login API completed successfully");
            return reply.status(200).send({
                success: true,
                data: loginResult
            });
        } catch (err: any) {
            request.log.error({ err, email }, "User login API failed");
            return reply.status(401).send({
                success: false,
                error: {
                    code: "LOGIN_FAILED",
                    message: err.message || "Invalid email or password."
                }
            });
        }
    });

    // POST /api/v1/user/auth/refresh
    typedApp.post("/refresh", {
        schema: {
            body: RefreshSessionRequestSchema
        }
    }, async (request, reply) => {
        const { refreshToken } = request.body;
        try {
            request.log.info("User session refresh API triggered");
            const session = await app.userRepository.refresh(refreshToken);
            request.log.info("User session refresh API completed successfully");
            return reply.status(200).send({
                success: true,
                data: session
            });
        } catch (err: any) {
            request.log.error({ err }, "User session refresh API failed");
            return reply.status(401).send({
                success: false,
                error: {
                    code: "REFRESH_FAILED",
                    message: err.message || "Invalid or expired refresh token."
                }
            });
        }
    });
}
