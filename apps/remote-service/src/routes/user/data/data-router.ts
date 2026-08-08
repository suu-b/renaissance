import { FastifyInstance } from "fastify";
import { projectRouter } from "./project-router.js";

export async function dataRouter(app: FastifyInstance) {
    await app.register(projectRouter, { prefix: "/project" });
}
