import fp from "fastify-plugin";
import envPaths from "env-paths";
import path from "node:path";

export default fp(async (app) => {
    const paths = envPaths("Renaissance");

    const userDataPath = paths.data;
    const logPath = paths.log;
    const workspacePath = path.join(userDataPath, "workspace-temp"); // TODO: harcoded but will handle when we extend the app to cloud capabilities
    const installPath = process.env.RENAISSANCE_INSTALL_PATH;
    const runtimePath = process.env.RENAISSANCE_RUNTIME_PATH;
    const gitPath = process.env.RENAISSANCE_GIT_PATH;
    const sqlitePath = process.env.RENAISSANCE_SQLITE_PATH;

    app.decorate("appPaths", {
        remoteUrl: "https://github.com/suu-b/renaissance-cgs.git",
        remotePath: "tmp",
        userDataPath,
        workspacePath,
        logPath,
        installPath,
        gitPath,
        sqlitePath
    });
});