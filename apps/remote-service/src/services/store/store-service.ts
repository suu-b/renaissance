export interface StoreService {
    publish(remote?: string, branch?: string): Promise<void>;
}
