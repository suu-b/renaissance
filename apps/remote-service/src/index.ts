import "dotenv/config";
import { buildApp } from "./app.js";

const app = buildApp();

async function start() {
    try {
        await app.listen({
            port: 8080,
            host: "127.0.0.1"
        });

        app.log.info({ address: app.server.address() }, "Renaissance service running");
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

const signals = ["SIGINT", "SIGTERM"] as const;

for (const signal of signals) {
    process.on(signal, async () => {
        app.log.info({ signal }, "Graceful shutdown begun...");
        try {
            await app.close();
            app.log.info("Server closed successfully.");
            process.exit(0);
        } catch (err) {
            app.log.error({ err }, "Error during graceful shutdown");
            process.exit(1);
        }
    });
}

start();