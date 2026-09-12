/**
 * VandC Service is an interface for the versioning and collaboration service.
 */
export interface VandcService {
    // Would init the local global repo for the user
    // VandcService instance should receive that path during init only
    init(): Promise<void>;

    // Scoped methods
    // A Scope is the level within a project
    // Would allow user to save their changes. Internally, stage changes
    scopedSaved(scopePath: string): Promise<void>;

    // Global methods
    // Global methods operate at the global repo level in a similar way like scoped ones.
    globalSaved(): Promise<void>;

    // Local file system operations
    // Create a folder at the specified path
    createFolder(path: string): Promise<void>;

    // Create a file at the specified path with dummy content
    createFile(path: string): Promise<void>;
}