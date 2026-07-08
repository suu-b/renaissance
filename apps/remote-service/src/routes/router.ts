import { FastifyInstance } from "fastify";

import { healthRoute } from "./health.js";

export async function router(app: FastifyInstance) {
    await app.register(healthRoute, { prefix: "/health" });
}