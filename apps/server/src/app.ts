import Fastify from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import cors from "@fastify/cors";

import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider
} from "fastify-type-provider-zod";

import { router } from "./routes/router.js";
import servicesPlugin from "./plugins/services.js"
import configPlugin from "./plugins/config.js";

export function buildApp() {
    const app = Fastify({
        logger: {
            level: 'debug'
    }
    }).withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)

    app.register(swagger, {
        openapi: {
            info: {
                title: "Renaissance local server",
                description: "Local Node process to serve Renaissance Desktop client",
                version: "1.0.0",
            },
        },
    });

    app.register(swaggerUi, {
        routePrefix: "/docs",
    });
    app.register(cors, {
            origin: "*",
            credentials: true,
    });

    // Registering Services
    app.register(configPlugin)
    app.register(servicesPlugin)

    // Registering the API Router
    app.register(router, { prefix: "/api/v1" })

    return app;
}