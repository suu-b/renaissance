import { GitCommit } from "@renaissance/shared"

/**
 * VandC Service is an interface for the versioning and collaboration service.
 */
export interface VandcService {
    // Would init the local global repo for the user
    // VandcService instance should receive that path during init only
    init(repoPath?: string): Promise<void>;

    // Scoped methods
    // A Scope is the level within a project
    // Would allow user to save their changes. Internally, stage changes
    scopedSaved(scopePath: string, content: string, message: string, encoding?: BufferEncoding, repoPath?: string): Promise<void>;

    // Global methods
    // Global methods operate at the global repo level in a similar way like scoped ones.
    globalSaved(): Promise<void>;

    // Local file system operations
    // Create a folder at the specified path
    createFolder(path: string, repoPath?: string): Promise<void>;

    // Create a file at the specified path with the given content
    createFile(path: string, content: string, encoding?: BufferEncoding, repoPath?: string): Promise<void>;

    // Delete a file at the specified path
    deleteFile(path: string, repoPath?: string): Promise<void>;

    // Delete a folder at the specified path
    deleteFolder(path: string, repoPath?: string): Promise<void>;

    getScopedHistory(path: string, limit: number): Promise<GitCommit[]>;

    getCommitDiff(filePath: string, hash: string): Promise<string>;

    // Branch management methods
    createBranch(branchName: string, repoPath?: string): Promise<void>;

    changeBranch(branchName: string, repoPath?: string): Promise<void>;

    deleteBranch(branchName: string, repoPath?: string): Promise<void>;

    getFileNames(folderPath: string): Promise<string[]>;

    getChangedFilesBetweenBranches(sourceBranch: string, targetBranch: string, repoPath?: string): Promise<string[]>;

    getFilesDiff(sourceBranch: string, targetBranch: string, filePaths: string[], repoPath?: string): Promise<Array<{ filePath: string; diff: string }>>;

    // Branch merge methods
    mergeBranches(mainBranchId: string, mergeBranchId: string, mainBranchName?: string, mergeBranchName?: string, message?: string, repoPath?: string): Promise<void>;
}
