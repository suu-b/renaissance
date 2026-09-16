import { buildApp } from "./app.js";
const app = buildApp();

async function start() {
  try {
    const port = Number(process.env.PORT);
    if (!port || Number.isNaN(port)) {
      throw new Error("Port configuration not found or invalid");
    }

    await app.listen({
      port: port, // electron will find an open port and pass here to run on
      host: "127.0.0.1",
    });

    const address = app.server.address();
    if (!address)
      throw new Error("Failed to get server address. Server failed to start");

    // Not saving in file. not easy to sync w/ client.
    //    const portFilePath = join(homedir(), '.renaissance', 'server-port.txt');
    //    const configDir = join(homedir(), '.renaissance');

    // if (!existsSync(configDir)) {
    //     mkdirSync(configDir, { recursive: true });
    // }

    // writeFileSync(portFilePath, port.toString());

    // console.log("Server running at:", address);
    console.log("Returning this port:", port);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
