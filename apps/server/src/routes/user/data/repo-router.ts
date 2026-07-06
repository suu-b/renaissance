import { FastifyInstance } from "fastify";
import { localRouter } from "./repo/local-router.js";
import { remoteRouter } from "./repo/remote-router.js";

export async function repoRouter(app: FastifyInstance) {
    await app.register(localRouter, { prefix: "/init" });
    await app.register(remoteRouter, { prefix: "/init" });
}