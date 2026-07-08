import { FastifyInstance } from "fastify";

export async function healthRoute(app: FastifyInstance) {
    app.get("/", async () => {
        return [
            {
                health: 'awesome!'
            }
        ];
    });

}