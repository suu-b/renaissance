import { FastifyBaseLogger } from "fastify";
import { execFile } from "child_process";
import { StoreService } from "../store-service";
import { promisify } from "util";

const execFileAsync = promisify(execFile);


export class GitHubStoreService implements StoreService {
    private logger: FastifyBaseLogger;
    private workspacePath: string;

    constructor(logger: FastifyBaseLogger, workspacePath: string) {
        this.logger = logger;
        this.workspacePath = workspacePath;
    }

    async publish(
        remote = "origin",
        branch = "main"
    ): Promise<void> {
        this.logger.info({ remote, branch }, "Pushing changes...");

        try {
            const { stdout, stderr } = await execFileAsync("git", [
                "-C",
                this.workspacePath,
                "push",
                remote,
                branch
            ]);

            this.logger.info({ stdout, stderr }, "Push completed successfully");
        } catch (err) {
            this.logger.error(
                { err },
                "Failed to push changes"
            );
            throw err;
        }
    }
}