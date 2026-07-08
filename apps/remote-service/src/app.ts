import Fastify from "fastify";
import {
    serializerCompiler,
    validatorCompiler,
    ZodTypeProvider
} from "fastify-type-provider-zod";

import bootstrapPlugin from "./plugins/bootstrap-plugin.js";
import workspacePlugin from "./plugins/workspace-plugin.js";

import { router } from "./routes/router.js";

export function buildApp() {
    const app = Fastify({
        logger: true
    }).withTypeProvider<ZodTypeProvider>();

    app.setValidatorCompiler(validatorCompiler)
    app.setSerializerCompiler(serializerCompiler)

    app.register(workspacePlugin);
    app.register(bootstrapPlugin);

    app.addHook("onReady", async () => {
        await app.bootstrapService.initialize();
    });

    app.addHook("onClose", async () => {
        await app.bootstrapService.shutdown();
    });

    app.register(router, { prefix: "/api/v1" })

    return app;
}