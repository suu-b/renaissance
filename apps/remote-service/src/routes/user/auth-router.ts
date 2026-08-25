import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
    RegisterUserRequestSchema,
    LoginRequestSchema,
    RefreshSessionRequestSchema,
    sendSuccess,
    sendError,
    Errors,
    CARResponses
} from "@renaissance/shared";

export async function authRouter(app: FastifyInstance) {
    const typedApp = app.withTypeProvider<ZodTypeProvider>();

    // POST /api/v1/user/auth/register
    typedApp.post("/register", {
        schema: {
            body: RegisterUserRequestSchema,
            response: CARResponses,
            tags: ["User Authentication"],
        }
    }, async (request, reply) => {
        const { email, password, displayName, username } = request.body;
        try {
            request.log.info({ email, username, displayName }, "User registration API triggered");
            const user = await app.userRepositoryService.register(email, password, displayName, username);
            request.log.info({ userId: user.id, username }, "User registration API completed successfully");
            return reply.status(201).send(sendSuccess(user));
        } catch (err: any) {
            request.log.error({ err, email, username }, "User registration API failed");
            return reply.status(400).send(sendError(Errors.USER_REGISTRATION_FAILED));
        }
    });


    // POST /api/v1/user/auth/login
    typedApp.post("/login", {
        schema: {
            body: LoginRequestSchema,
            response: CARResponses,
            tags: ["User Authentication"],  
        }
    }, async (request, reply) => {
        const { email, password } = request.body;
        try {
            request.log.info({ email }, "User login API triggered");
            const loginResult = await app.userRepositoryService.login(email, password);
            request.log.info({ userId: loginResult.user.id }, "User login API completed successfully");
            return reply.status(200).send(sendSuccess(loginResult));
        } catch (err: any) {
            request.log.error({ err, email }, "User login API failed");
            return reply.status(401).send(sendError(Errors.USER_LOGIN_FAILED));
        }
    });

    // POST /api/v1/user/auth/refresh
    typedApp.post("/refresh", {
        schema: {
            body: RefreshSessionRequestSchema,
            response: CARResponses,
            tags: ["User Authentication"]
        }
    }, async (request, reply) => {
        const { refreshToken } = request.body;
        try {
            request.log.info("User session refresh API triggered");
            const session = await app.userRepositoryService.refresh(refreshToken);
            request.log.info("User session refresh API completed successfully");
            return reply.status(200).send(sendSuccess(session));
        } catch (err: any) {
            request.log.error({ err }, "User session refresh API failed");
            return reply.status(401).send(sendError(Errors.USER_REFRESH_FAILED));
        }
    });
}
