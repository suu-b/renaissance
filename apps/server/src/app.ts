import Fastify from "fastify";
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
        logger: true
    }).withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)

    // Registering Services
    app.register(configPlugin)
    app.register(servicesPlugin)

    // Registering the API Router
    app.register(router, { prefix: "/api/v1" })

    return app;
}