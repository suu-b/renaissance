export interface LockService {
    /**
     * Executes the given action after acquiring a lock for the key.
     * Guarantees the lock is released when the action completes or throws.
     */
    withLock<T>(action: () => Promise<T>): Promise<T>;
}
