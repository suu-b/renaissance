// Core Node.js modules
// child_process spawns a process to run an external terminal command
// promisify converts callback based Node.js functions to promise based functions
// path is used to resolve the path to the repository
// fs is used for file system operations
import { execFile } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";

import { GitCommit } from "@renaissance/shared"

// Project Modules
// vandc-service is the interface for the versioning and collaboration service
import { VandcService } from "../vandc-service.js";

const execFileAsync = promisify(execFile);

export class GitProvider implements VandcService {
    private repoPath: string;

    constructor(repoPath: string) {
        this.repoPath = repoPath;
    }

    async init(repoPath?: string): Promise<void> {
        try {
            const cwd = repoPath || this.repoPath;
            await execFileAsync("git", ["init"], { cwd });
        } catch (error) {
            console.error(`Failed to initialize git repository:`, error);
            throw error;
        }
    }

    async scopedSaved(scopePath: string, content: string, message: string, encoding?: BufferEncoding, repoPath?: string): Promise<void> {
        try {
            await fs.writeFile(scopePath, content, encoding);
            const cwd = repoPath || this.repoPath;
            await execFileAsync("git", ["add", "--", scopePath], { cwd });

            // Handle the case where this might be the first commit
            try {
                await execFileAsync("git", ["commit", "-m", message], { cwd });
            } catch (commitError) {
                // If commit fails due to no commits, try with --allow-empty
                const errorStr = String(commitError);
                if (errorStr.includes("does not have any commits yet") || errorStr.includes("nothing to commit")) {
                    // Create an initial commit first
                    await execFileAsync("git", ["commit", "--allow-empty", "-m", "Initial commit"], { cwd });
                    // Then try the actual commit again
                    await execFileAsync("git", ["commit", "-m", message], { cwd });
                } else {
                    throw commitError;
                }
            }
        } catch (error) {
            console.error(`Failed to save scope changes at ${scopePath}:`, error);
            throw error;
        }
    }

    async globalSaved(): Promise<void> {
        if (!this.repoPath) {
            throw new Error("Repository path has not been initialized. Call init(repoPath) first.");
        }
        try {
            await execFileAsync("git", ["add", "."], { cwd: this.repoPath });
        } catch (error) {
            console.error(`Failed to save global changes at ${this.repoPath}:`, error);
            throw error;
        }
    }

    async createFolder(folderPath: string, repoPath?: string): Promise<void> {
        try {
            await fs.mkdir(folderPath, { recursive: true });

            const cwd = repoPath || this.repoPath;

            // Only perform git operations if this is a git repository
            try {
                // Check if .git directory exists
                const gitDir = path.join(cwd, '.git');
                await fs.access(gitDir);

                // Add .gitkeep file to ensure the folder is tracked by git
                const gitkeepPath = path.join(folderPath, '.gitkeep');
                await fs.writeFile(gitkeepPath, '# This file ensures the folder is tracked by git\n');

                await execFileAsync("git", ["add", "--", gitkeepPath], { cwd });

                // Handle the case where this might be the first commit
                try {
                    await execFileAsync("git", ["commit", "-m", `Add ${path.basename(folderPath)} folder`], { cwd });
                } catch (commitError) {
                    // If commit fails due to no commits, try with --allow-empty
                    const errorStr = String(commitError);
                    if (errorStr.includes("does not have any commits yet")) {
                        await execFileAsync("git", ["commit", "--allow-empty", "-m", `Add ${path.basename(folderPath)} folder`], { cwd });
                    } else {
                        throw commitError;
                    }
                }
            } catch (gitError) {
                // If git operations fail (e.g., not a git repo yet), just continue
                console.log(`Skipping git operations for folder creation (git repo may not be initialized yet)`);
            }
        } catch (error) {
            console.error(`Failed to create folder at ${folderPath}:`, error);
            throw error;
        }
    }

    async createFile(filePath: string, content: string, encoding?: BufferEncoding, repoPath?: string): Promise<void> {
        try {
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(filePath, content, encoding);
            const cwd = repoPath || this.repoPath;

            // Only perform git operations if this is a git repository
            try {
                // Check if .git directory exists
                const gitDir = path.join(cwd, '.git');
                await fs.access(gitDir);

                await execFileAsync("git", ["add", "--", filePath], { cwd });

                // Commit the file with a descriptive message
                const fileName = path.basename(filePath);
                try {
                    await execFileAsync("git", ["commit", "-m", `Add ${fileName}`], { cwd });
                } catch (commitError) {
                    // If commit fails due to no commits, try with --allow-empty
                    const errorStr = String(commitError);
                    if (errorStr.includes("does not have any commits yet")) {
                        await execFileAsync("git", ["commit", "--allow-empty", "-m", `Add ${fileName}`], { cwd });
                    } else {
                        throw commitError;
                    }
                }
            } catch (gitError) {
                // If git operations fail (e.g., not a git repo yet), just continue
                console.log(`Skipping git operations for file creation (git repo may not be initialized yet)`);
            }
        } catch (error) {
            console.error(`Failed to create file at ${filePath}:`, error);
            throw error;
        }
    }

    async deleteFile(filePath: string, repoPath?: string): Promise<void> {
        try {
            const cwd = repoPath || this.repoPath;

            // Only perform git operations if this is a git repository
            try {
                // Check if .git directory exists
                const gitDir = path.join(cwd, '.git');
                await fs.access(gitDir);

                // Stage the deletion in git
                await execFileAsync("git", ["rm", "--", filePath], { cwd });

                // Commit the deletion with a descriptive message
                const fileName = path.basename(filePath);
                try {
                    await execFileAsync("git", ["commit", "-m", `Delete ${fileName}`], { cwd });
                } catch (commitError) {
                    // If commit fails due to no commits, try with --allow-empty
                    const errorStr = String(commitError);
                    if (errorStr.includes("does not have any commits yet")) {
                        await execFileAsync("git", ["commit", "--allow-empty", "-m", `Delete ${fileName}`], { cwd });
                    } else {
                        throw commitError;
                    }
                }
            } catch (gitError) {
                // If git operations fail (e.g., not a git repo yet), just delete the file directly
                console.log(`Skipping git operations for file deletion (git repo may not be initialized yet)`);
                try {
                    await fs.unlink(filePath);
                } catch (unlinkError) {
                    console.error(`Failed to delete file directly: ${unlinkError}`);
                    throw unlinkError;
                }
            }
        } catch (error) {
            console.error(`Failed to delete file at ${filePath}:`, error);
            throw error;
        }
    }

    async deleteFolder(folderPath: string, repoPath?: string): Promise<void> {
        try {
            const cwd = repoPath || this.repoPath;

            // Only perform git operations if this is a git repository
            try {
                // Check if .git directory exists
                const gitDir = path.join(cwd, '.git');
                await fs.access(gitDir);

                // Stage the folder deletion in git (including .gitkeep file)
                const gitkeepPath = path.join(folderPath, '.gitkeep');
                try {
                    await execFileAsync("git", ["rm", "-r", "--", folderPath], { cwd });
                } catch (rmError) {
                    // If folder removal fails, try removing just the .gitkeep file
                    try {
                        await execFileAsync("git", ["rm", "--", gitkeepPath], { cwd });
                    } catch (gitkeepError) {
                        console.log(`Could not remove folder or .gitkeep from git, proceeding with direct deletion`);
                    }
                }

                // Commit the deletion with a descriptive message
                const folderName = path.basename(folderPath);
                try {
                    await execFileAsync("git", ["commit", "-m", `Delete ${folderName} folder`], { cwd });
                } catch (commitError) {
                    // If commit fails due to no commits, try with --allow-empty
                    const errorStr = String(commitError);
                    if (errorStr.includes("does not have any commits yet")) {
                        await execFileAsync("git", ["commit", "--allow-empty", "-m", `Delete ${folderName} folder`], { cwd });
                    } else {
                        throw commitError;
                    }
                }

                // Delete the actual folder from filesystem
                await fs.rm(folderPath, { recursive: true, force: true });
            } catch (gitError) {
                // If git operations fail (e.g., not a git repo yet), just delete the folder directly
                console.log(`Skipping git operations for folder deletion (git repo may not be initialized yet)`);
                await fs.rm(folderPath, { recursive: true, force: true });
            }
        } catch (error) {
            console.error(`Failed to delete folder at ${folderPath}:`, error);
            throw error;
        }
    }

    async getScopedHistory(filePath: string, limit: number = 30): Promise<GitCommit[]> {
        try {
            let cwd = this.repoPath;
            let relativePath: string | null = null;

            try {
                const stat = await fs.stat(filePath);
                if (stat.isDirectory()) {
                    cwd = filePath;
                } else {
                    cwd = path.dirname(filePath);
                    relativePath = path.basename(filePath);
                }
            } catch {
                cwd = path.extname(filePath) ? path.dirname(filePath) : filePath;
                relativePath = path.basename(filePath);
            }

            const args = [
                "log",
                "--format=%H|%s",
                "-n",
                limit.toString()
            ];

            if (relativePath) {
                args.push("--", relativePath);
            }

            const { stdout } = await execFileAsync("git", args, { cwd });

            return stdout
                .trim()
                .split("\n")
                .filter(Boolean)
                .map((line) => {
                    const [hash, ...messageParts] = line.split("|");

                    return {
                        hash,
                        message: messageParts.join("|"),
                    };
                });
        } catch (error) {
            console.error(
                `Failed to get git history for path ${filePath}:`,
                error
            );
            throw error;
        }
    }

    async getCommitDiff(filePath: string, hash: string): Promise<string> {
        try {
            let cwd = this.repoPath;
            try {
                const stat = await fs.stat(filePath);
                cwd = stat.isDirectory() ? filePath : path.dirname(filePath);
            } catch {
                cwd = path.extname(filePath) ? path.dirname(filePath) : filePath;
            }

            const { stdout } = await execFileAsync(
                "git",
                [
                    "show",
                    hash
                ],
                { cwd }
            );

            return stdout;
        } catch (error) {
            console.error(
                `Failed to get commit diff for ${filePath} at ${hash}:`,
                error
            );
            throw error;
        }
    }

    async createBranch(branchName: string, repoPath?: string): Promise<void> {
        try {
            const cwd = repoPath || this.repoPath;
            await execFileAsync("git", ["branch", branchName], { cwd });
        } catch (error) {
            console.error(`Failed to create branch ${branchName}:`, error);
            throw error;
        }
    }

    async changeBranch(branchName: string, repoPath?: string): Promise<void> {
        try {
            const cwd = repoPath || this.repoPath;
            try {
                const { stdout } = await execFileAsync("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd });
                if (stdout.trim() === branchName) {
                    return;
                }
            } catch {
                // If rev-parse fails, proceed to checkout
            }
            await execFileAsync("git", ["checkout", branchName], { cwd });
        } catch (error) {
            console.error(`Failed to change to branch ${branchName}:`, error);
            throw error;
        }
    }

    async deleteBranch(branchName: string, repoPath?: string): Promise<void> {
        try {
            const cwd = repoPath || this.repoPath;
            await execFileAsync("git", ["branch", "-D", branchName], { cwd });
        } catch (error) {
            console.error(`Failed to delete branch ${branchName}:`, error);
            throw error;
        }
    }

    async getFileNames(folderPath: string): Promise<string[]> {
        try {
            const entries = await fs.readdir(folderPath, { withFileTypes: true });
            const fileNames = entries
                .filter(entry => entry.isFile())
                .map(entry => entry.name);
            return fileNames;
        } catch (error) {
            console.error(`Failed to read file names from ${folderPath}:`, error);
            throw error;
        }
    }

    async getChangedFilesBetweenBranches(sourceBranch: string, targetBranch: string, repoPath?: string): Promise<string[]> {
        try {
            const cwd = repoPath || this.repoPath;
            const { stdout } = await execFileAsync("git", ["diff", sourceBranch, targetBranch, "--name-only"], { cwd });

            return stdout
                .trim()
                .split("\n")
                .filter(Boolean);
        } catch (error) {
            console.error(`Failed to get changed files between ${sourceBranch} and ${targetBranch}:`, error);
            throw error;
        }
    }

    async getFilesDiff(sourceBranch: string, targetBranch: string, filePaths: string[], repoPath?: string): Promise<Array<{ filePath: string; diff: string }>> {
        try {
            const cwd = repoPath || this.repoPath;
            const diffs: Array<{ filePath: string; diff: string }> = [];

            for (const filePath of filePaths) {
                try {
                    const { stdout } = await execFileAsync("git", ["diff", sourceBranch, targetBranch, "--", filePath], { cwd });
                    diffs.push({
                        filePath,
                        diff: stdout
                    });
                } catch (error) {
                    console.error(`Failed to get diff for file ${filePath}:`, error);
                    diffs.push({
                        filePath,
                        diff: ""
                    });
                }
            }

            return diffs;
        } catch (error) {
            console.error(`Failed to get files diff between ${sourceBranch} and ${targetBranch}:`, error);
            throw error;
        }
    }
}
