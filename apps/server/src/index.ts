import { buildApp } from "./app.js";

const app = buildApp();

async function start() {
    try {
        await app.listen({
            port: 0, // this is important - we do not want to hardcode our port but let the OS return one available for us
            host: "127.0.0.1"
        });

        console.log("Server running at:", app.server.address());
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();