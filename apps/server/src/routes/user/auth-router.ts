import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const ErrorResponseSchema = z.object({
  success: z.boolean(),
  error: z.object({
    message: z.string(),
  }),
});

export async function authRouter(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // OAuth endpoints removed - authentication disabled
}
