import Fastify from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider
} from "fastify-type-provider-zod";

import { router } from "./routes/router.js";

export function buildApp() {
    const app = Fastify({
        logger: true
    }).withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)

    // Registering the API Router
    app.register(router, { prefix: "/api/v1" })

    return app;
}