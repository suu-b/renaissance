import fp from "fastify-plugin";
import envPaths from "env-paths";

export default fp(async (app) => {
    const paths = envPaths("Renaissance");

    const userDataPath = paths.data;
    const logPath = paths.log;
    const workspacePath = process.env.USER_RENAISSANCE_TMP_WS_DIR_PATH;
    const userProfilePath = process.env.USER_RENAISSANCE_PROFILE_PATH;
    const installPath = process.env.RENAISSANCE_INSTALL_PATH;
    const runtimePath = process.env.RENAISSANCE_RUNTIME_PATH;
    const gitPath = process.env.RENAISSANCE_GIT_PATH;
    const sqlitePath = process.env.RENAISSANCE_SQLITE_PATH;

    app.decorate("appPaths", {
        remoteUrl: "https://github.com/suu-b/renaissance-cgs.git",
        remotePath: "tmp",
        userDataPath,
        workspacePath,
        userProfilePath,
        logPath,
        installPath,
        gitPath,
        sqlitePath
    });
});