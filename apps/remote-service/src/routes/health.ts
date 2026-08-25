import { sendSuccess } from "@renaissance/shared";
import { FastifyInstance } from "fastify";

export async function healthRoute(app: FastifyInstance) {
    app.get("/", {
        schema: {
            tags: ["Health"],
        }
    }, async () => {
        return (sendSuccess({
            health: 'awesome!'
        }));
    });

}