/**
 * Repository Service is an interface for the repository service.
 */
export interface RepositoryService {
    // Would init the local global repo for the user
    init(): Promise<void>;

    // Scoped methods
    // A Scope is the level within a project
    // Would commit+push user changes to the remote
    scopedPush(): Promise<void>;

    // Global methods
    // Global methods operate at the global repo level in a similar way like scoped ones.
    globalPush(): Promise<void>;
}