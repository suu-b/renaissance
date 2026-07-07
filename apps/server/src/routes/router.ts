import { FastifyInstance } from "fastify";

import { healthRoute } from "./health.js";
import { userRouter } from "./user/router.js";
import { globalRouter } from "./global/router.js";

export async function router(app: FastifyInstance) {
    await app.register(healthRoute, { prefix: "/health" });
    await app.register(userRouter, { prefix: "/user" });
    await app.register(globalRouter, { prefix: "/global" });
}