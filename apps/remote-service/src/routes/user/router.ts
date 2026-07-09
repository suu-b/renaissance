import { FastifyInstance } from "fastify";
import { authRouter } from "./auth-router.js";
import { dataRouter } from "./data/data-router.js";

export async function userRouter(app: FastifyInstance) {
    await app.register(authRouter, { prefix: "/auth" });
    await app.register(dataRouter, { prefix: "/data" });
}
