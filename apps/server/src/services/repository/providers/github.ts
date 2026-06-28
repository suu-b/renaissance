// Core Node.js modules
// child_process spawns a process to run an external terminal command
// promisify converts callback based Node.js functions to promise based functions
// path is used to resolve the path to the repository
import { execFile } from "child_process";
import { promisify } from "util";

// Project Modules
// Repository Service is an interface for the providers
import { RepositoryService } from "../repository-service.js";

const execFileAsync = promisify(execFile);

export class GitHubProvider implements RepositoryService {
    private repoPath: string;
    private readonly remoteUrl?: string;

    constructor(remoteUrl?: string, repoPath?: string) {
        this.remoteUrl = remoteUrl;
        this.repoPath = repoPath || "";
    }

    async init(repoPath: string): Promise<void> {
        this.repoPath = repoPath;
        try {
            // Configure remote URL if provided
            if (this.remoteUrl) {
                try {
                    // Try adding the remote
                    await execFileAsync("git", ["remote", "add", "origin", this.remoteUrl], { cwd: this.repoPath });
                } catch (addError: any) {
                    // If it already exists, update it
                    if (addError.message && addError.message.includes("already exists")) {
                        await execFileAsync("git", ["remote", "set-url", "origin", this.remoteUrl], { cwd: this.repoPath });
                    } else {
                        throw addError;
                    }
                }
            }
        } catch (error) {
            console.error(`Failed to initialize repository provider at ${this.repoPath}:`, error);
            throw error;
        }
    }

    private async commitAndPush(cwd: string, message: string): Promise<void> {
        if (!this.repoPath) {
            throw new Error("Repository path has not been initialized. Call init(repoPath) first.");
        }

        try {
            await execFileAsync("git", ["commit", "-m", message], { cwd });
        } catch (commitError: any) {
            const stderr = commitError.stderr || commitError.message || "";
            const isNothingToCommit =
                stderr.includes("nothing to commit") ||
                stderr.includes("no changes added to commit") ||
                stderr.includes("nothing added to commit");

            if (isNothingToCommit) {
                console.log("No staged changes to commit.");
            } else {
                console.error(`Failed to commit changes in ${cwd}:`, commitError);
                throw commitError;
            }
        }

        try {
            await execFileAsync("git", ["push", "origin", "HEAD"], { cwd });
        } catch (pushError) {
            console.error(`Failed to push changes from ${cwd} to remote origin:`, pushError);
            throw pushError;
        }
    }

    async scopedPush(scopePath: string, message: string): Promise<void> {
        await this.commitAndPush(scopePath, message);
    }

    async globalPush(message: string): Promise<void> {
        await this.commitAndPush(this.repoPath, message);
    }
}
