import { FastifyInstance } from "fastify";
import { globalProjectRouter } from "./project-router.js";

export async function globalDataRouter(app: FastifyInstance) {
    await app.register(globalProjectRouter, { prefix: "/project" });
}
