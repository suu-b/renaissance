import { Mutex } from "async-mutex";
import { LockService } from "../lock-service";

export class InMemoryLockService implements LockService {
    private mutex = new Mutex();

    async withLock<T>(action: () => Promise<T>): Promise<T> {
        return this.mutex.runExclusive(action);
    }
}