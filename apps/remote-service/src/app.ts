import Fastify from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider
} from "fastify-type-provider-zod";

import servicesPlugin from "./plugins/services-plugin.js";
import supabasePlugin from "./plugins/supabase-plugin.js";
import repositoryPlugin from "./plugins/repository-plugin.js";

import { router } from "./routes/router.js";

export function buildApp() {
    const app = Fastify({
        logger: true
    }).withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)

    app.register(supabasePlugin);
    app.register(repositoryPlugin);
    app.register(servicesPlugin);

    app.addHook("onReady", async () => {
        await app.bootstrapService.initialize();
    });

    app.addHook("onClose", async () => {
        await app.bootstrapService.shutdown();
    });

    app.register(router, { prefix: "/api/v1" })

    return app;
}