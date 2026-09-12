import { FastifyInstance } from "fastify";
import { projectRouter } from "./project-router.js";
import { repoRouter } from "./repo-router.js";
import { chapterRouter } from "./chapter-router.js";

export async function dataRouter(app: FastifyInstance) {
    await app.register(projectRouter, { prefix: "/project" });
    await app.register(repoRouter, { prefix: "/repo" });
    await app.register(chapterRouter, { prefix: "/chapter" });
}
