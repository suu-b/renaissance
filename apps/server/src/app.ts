import Fastify from "fastify";
import cors from "@fastify/cors";

import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

import { router } from "./routes/router.js";
import servicesPlugin from "./plugins/services.js";
import configPlugin from "./plugins/config.js";
import sqlitePlugin from "./plugins/sqlite-plugin.js";

import MigrationRunner from "./db/migrationRunner.js";

import config from "./config.js";

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: "debug",
    },
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  if (config.ENABLE_SWAGGER) {
    const swagger = (await import("@fastify/swagger")).default;
    const swaggerUi = (await import("@fastify/swagger-ui")).default;

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
  }
  app.register(cors, {
    origin: "*",
    credentials: true,
  });

  // Registering Services
  app.register(configPlugin);
  app.register(sqlitePlugin);
  app.register(servicesPlugin);

  // Registering the API Router
  app.register(router, { prefix: "/api/v1" });

  app.get("/health", async (request, reply) => {
    return reply.code(200).send({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  app.post("/migrate", async (request, reply) => {
    const migrationRunner = new MigrationRunner(app.db);
    migrationRunner.run();

    return reply.code(200).send({
      status: "ok",
      timestamp: new Date().toISOString(),
    });
  });

  return app;
}
