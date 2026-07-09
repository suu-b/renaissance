import { FastifyInstance } from "fastify";
import { globalDataRouter } from "./data/data-router.js";

export async function globalRouter(app: FastifyInstance) {
    await app.register(globalDataRouter, { prefix: "/data" });
}
