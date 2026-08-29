import { buildApp } from "./app.js";

import { writeFileSync, mkdirSync, existsSync } from "fs"
import { join } from "path";
import { homedir } from "os";

const app = buildApp();

async function start() {
    try {
        await app.listen({
            port: 0, // this is important - we do not want to hardcode our port but let the OS return one available for us
            host: "127.0.0.1"
        });

        const address = app.server.address();
        if(!address) throw new Error("Failed to get server address. Server failed to start");

        const port = typeof address === 'string' ? parseInt(address.split(':')[1]) : address.port;

       const portFilePath = join(homedir(), '.renaissance', 'server-port.txt');
       const configDir = join(homedir(), '.renaissance');
       
       if (!existsSync(configDir)) {
           mkdirSync(configDir, { recursive: true });
       }
       
       writeFileSync(portFilePath, port.toString());


        console.log("Server running at:", address);
        console.log("Port written to:", portFilePath);

    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();