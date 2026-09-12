import { FastifyInstance } from "fastify";
import { dataRouter } from "./data/data-router.js";
import { authRouter } from "./auth-router.js";

export async function userRouter(app: FastifyInstance) {
    await app.register(dataRouter, { prefix: "/data" });
    await app.register(authRouter, { prefix: "/auth" });
}
