import { execFile, spawn } from "child_process";
import * as fsPromises from "fs/promises";
import * as path from "path";
import { promisify } from "util";
import { FastifyBaseLogger } from "fastify";

const execFileAsync = promisify(execFile);

export interface Workspace {
    path: string;
}

/**
 * Responsible for CGS-local workspace lifecycle.
 *
 * Note: Registered as a singleton plugin and bound to the server startup/shutdown hooks.
 * In a future session-based model, this may be instantiated per session.
 */
export class WorkspaceService {
    constructor(
        private readonly logger: FastifyBaseLogger,
        private readonly workspace: Workspace
    ) { }

    async initialize(): Promise<void> {
        this.logger.info("Initializing workspace...");

        await fsPromises.mkdir(
            path.dirname(this.workspace.path),
            {
                recursive: true
            }
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

        this.logger.info(
            { workspacePath: this.workspace.path, gitUrl },
            "Cloning CGS repository..."
        );

        try {
            const result = await execFileAsync("git", [
                "clone",
                cloneUrl,
                this.workspace.path
            ]);

            this.logger.info({ stdout: result.stdout });
            this.logger.info({ stderr: result.stderr });
            this.logger.info("CGS repository cloned successfully.");
        } catch (error) {
            this.logger.error(
                { error: error instanceof Error ? error.message : String(error) },
                "Failed to clone CGS repository. Initiating cleanup..."
            );

            await this.destroy();

            throw new Error(
                `Failed to clone CGS repository: ${error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    async applyPatch(patch: string): Promise<void> {
        this.logger.info(
            { workspace: this.workspace.path },
            "Applying git patch"
        );

        const git = spawn("git", [
            "-C",
            this.workspace.path,
            "apply",
            "-"
        ]);

        let stderr = "";

        git.stderr.on("data", (data) => {
            stderr += data.toString();
        });

        git.on("error", (err) => {
            this.logger.error({ err }, "Failed to spawn git process");
        });

        git.stdin.write(patch);
        git.stdin.end();

        await new Promise<void>((resolve, reject) => {
            git.on("close", (code) => {
                if (code === 0) {
                    this.logger.info("Git patch applied successfully");
                    resolve();
                } else {
                    this.logger.error(
                        {
                            exitCode: code,
                            stderr
                        },
                        "Failed to apply git patch"
                    );

                    reject(new Error(`git apply failed (${code})\n${stderr}`));
                }
            });
        });
    }

    async stageAll(): Promise<void> {
        this.logger.info("Staging workspace changes...");

        const { stdout, stderr } = await execFileAsync("git", [
            "-C",
            this.workspace.path,
            "add",
            "."
        ]);

        this.logger.info({ stdout, stderr }, "Workspace staged successfully");
    }

    async commit(
        message: string,
        author?: {
            name: string;
            email: string;
        }
    ): Promise<void> {
        this.logger.info({ message }, "Creating git commit...");

        const args = [
            "-C",
            this.workspace.path,
            "commit",
            "-m",
            message
        ];

        if (author) {
            args.push(
                `--author=${author.name} <${author.email}>`
            );
        }

        try {
            const { stdout, stderr } = await execFileAsync("git", args);

            this.logger.info(
                { stdout, stderr },
                "Git commit created successfully"
            );
        } catch (err) {
            this.logger.error(
                { err },
                "Failed to create git commit"
            );
            throw err;
        }
    }

    async destroy(): Promise<void> {
        const workspaceDir = path.dirname(this.workspace.path);

        this.logger.info(
            { workspaceDir },
            "Destroying workspace..."
        );

        try {
            await fsPromises.rm(
                workspaceDir,
                {
                    recursive: true,
                    force: true
                }
            );

            this.logger.info("Temporary workspace removed successfully");
        } catch (error) {
            this.logger.error(
                { error: error instanceof Error ? error.message : String(error) },
                "Error cleaning up workspace"
            );
        }
    }
}
