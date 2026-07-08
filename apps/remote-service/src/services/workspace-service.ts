import { execFile } from "child_process";
import { randomUUID } from "crypto";
import * as fsPromises from "fs/promises";
import * as os from "os";
import * as path from "path";
import { promisify } from "util";
import { FastifyBaseLogger } from "fastify";

const execFileAsync = promisify(execFile);

/**
 * Responsible for CGS-local workspace lifecycle.
 *
 * Note: Registered as a singleton plugin and bound to the server startup/shutdown hooks.
 * In a future session-based model, this may be instantiated per session.
 */
export class WorkspaceService {
    private logger: FastifyBaseLogger;
    private _sessionId?: string;
    private _workspacePath?: string;

    constructor(logger: FastifyBaseLogger) {
        this.logger = logger;
    }

    async initialize(): Promise<void> {
        this.logger.info("Initializing workspace root directory...");
        const workspaceRoot = path.join(os.tmpdir(), "workspace");

        await fsPromises.mkdir(workspaceRoot, {
            recursive: true
        });

        this._sessionId = randomUUID();

        this._workspacePath = path.join(
            workspaceRoot,
            this._sessionId,
            "cgs"
        );

        this.logger.info(
            { sessionId: this._sessionId, workspacePath: this._workspacePath },
            "Workspace session path generated"
        );

        const gitUrl = process.env.GITHUB_URL;
        const gitPat = process.env.GITHUB_PAT;

        if (!gitUrl) {
            const err = new Error("GITHUB_URL is not defined in environment");
            this.logger.error(err.message);
            throw err;
        }

        let cloneUrl = gitUrl;

        if (gitPat && cloneUrl.startsWith("https://")) {
            cloneUrl = cloneUrl.replace(
                "https://",
                `https://x-access-token:${gitPat}@`
            );
        }

        this.logger.info({ gitUrl }, "Cloning CGS repository...");
        try {
            const result = await execFileAsync("git", [
                "clone",
                cloneUrl,
                this._workspacePath,
            ]);

            this.logger.info({ stdout: result.stdout });
            this.logger.info({ stderr: result.stderr });
            this.logger.info("CGS repository cloned successfully. Workspace initialized.");
        } catch (error) {
            this.logger.error(
                { error: error instanceof Error ? error.message : String(error) },
                "Failed to clone CGS repository. Initiating cleanup..."
            );
            await this.destroy();

            throw new Error(
                `Failed to clone CGS repository: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    async destroy(): Promise<void> {
        if (!this._sessionId) {
            this.logger.info("No active workspace session to destroy");
            return;
        }

        const sessionDir = path.join(
            os.tmpdir(),
            "workspace",
            this._sessionId
        );

        this.logger.info({ sessionId: this._sessionId, sessionDir }, "Destroying workspace session...");

        try {
            await fsPromises.rm(
                sessionDir,
                {
                    recursive: true,
                    force: true
                }
            );
            this.logger.info("Temporary workspace files removed successfully");
        } catch (error) {
            this.logger.error(
                { error: error instanceof Error ? error.message : String(error) },
                "Error cleaning up temporary workspace files"
            );
        } finally {
            this._sessionId = undefined;
            this._workspacePath = undefined;
            this.logger.info("Workspace session destroyed and references cleared");
        }
    }

    get workspacePath(): string {
        if (!this._workspacePath) {
            throw new Error(
                "WorkspaceService is not initialized"
            );
        }

        return this._workspacePath;
    }

    get sessionId(): string {
        if (!this._sessionId) {
            throw new Error(
                "WorkspaceService is not initialized"
            );
        }

        return this._sessionId;
    }

    getWorkspacePath(): string {
        return this.workspacePath;
    }

    getSessionId(): string {
        return this.sessionId;
    }
}