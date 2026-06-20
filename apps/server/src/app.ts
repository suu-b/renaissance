import Fastify from "fastify";
import { healthRoute } from "./health.js";

export function buildApp() {
    const app = Fastify({
        logger: true
    });

    app.register(healthRoute)

    return app;
}