// Core Node.js modules
// child_process spawns a process to run an external terminal command
// promisify converts callback based Node.js functions to promise based functions
// path is used to resolve the path to the repository
// fs is used for file system operations
import { execFile } from "child_process";
import { promisify } from "util";
import { promises as fs } from "fs";
import path from "path";

// Project Modules
// vandc-service is the interface for the versioning and collaboration service
import { VandcService } from "../vandc-service.js";

const execFileAsync = promisify(execFile);

export class GitProvider implements VandcService {
    private repoPath: string;

    constructor(repoPath: string) {
        this.repoPath = repoPath;
    }

    async init(): Promise<void> {
        try {
            await execFileAsync("git", ["init"], { cwd: this.repoPath });
        } catch (error) {
            console.error(`Failed to initialize git repository at ${this.repoPath}:`, error);
            throw error;
        }
    }

    async scopedSaved(scopePath: string): Promise<void> {
        try {
            await execFileAsync("git", ["add", "."], { cwd: scopePath });
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

    async createFolder(folderPath: string): Promise<void> {
        try {
            await fs.mkdir(folderPath, { recursive: true });
        } catch (error) {
            console.error(`Failed to create folder at ${folderPath}:`, error);
            throw error;
        }
    }

    async createFile(filePath: string): Promise<void> {
        try {
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(filePath, "dummy");
        } catch (error) {
            console.error(`Failed to create file at ${filePath}:`, error);
            throw error;
        }
    }
}
