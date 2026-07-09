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
        try {
            const { email, password, displayName, username } = request.body;
            const user = await app.userRepository.register(email, password, displayName, username);
            return reply.status(201).send({
                success: true,
                data: user
            });
        } catch (err: any) {
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
        try {
            const { email, password } = request.body;
            const loginResult = await app.userRepository.login(email, password);
            return reply.status(200).send({
                success: true,
                data: loginResult
            });
        } catch (err: any) {
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
        try {
            const { refreshToken } = request.body;
            const session = await app.userRepository.refresh(refreshToken);
            return reply.status(200).send({
                success: true,
                data: session
            });
        } catch (err: any) {
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
