import fp from "fastify-plugin";
import envPaths from "env-paths";
import { mkdir } from "node:fs/promises";
import path from "node:path";

export default fp(async (app) => {
    const paths = envPaths("Renaissance");
    const projectsPath = path.join(paths.data, "projects");

    await mkdir(projectsPath, { recursive: true });

    app.decorate("appPaths", {
        remoteUrl: "https://github.com/suu-b/renaissance-cgs.git",
        // TODO: need to replace with user specific username
        remotePath: "tmp",
        projects: projectsPath,
    });
});