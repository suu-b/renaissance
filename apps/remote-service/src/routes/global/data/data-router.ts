import { FastifyInstance } from "fastify";
import { globalProjectRouter } from "./project-router.js";
import { globalUserRouter } from "./user-router.js"

export async function globalDataRouter(app: FastifyInstance) {
    await app.register(globalProjectRouter, { prefix: "/project" });
    await app.register(globalUserRouter, { prefix: "/user" });
}
