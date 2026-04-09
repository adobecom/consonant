// src/cache.ts — In-memory cache with TTL + file-watch invalidation
import { watch } from "fs";
const TTL_MS = 30_000; // 30s local dev; override via CACHE_TTL_MS env
class DSCache {
    store = new Map();
    watchers = new Map();
    ttl = Number(process.env.CACHE_TTL_MS ?? TTL_MS);
    get(key) {
        const entry = this.store.get(key);
        if (!entry)
            return undefined;
        if (Date.now() - entry.timestamp > this.ttl) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }
    set(key, value) {
        this.store.set(key, { value, timestamp: Date.now() });
    }
    invalidate(key) {
        this.store.delete(key);
    }
    /** Watch a directory; invalidate cacheKey on any change. Safe to call repeatedly. */
    watch(path, cacheKey) {
        if (this.watchers.has(path))
            return;
        try {
            const watcher = watch(path, { recursive: true, persistent: false }, () => {
                this.invalidate(cacheKey);
            });
            this.watchers.set(path, watcher);
        }
        catch {
            // Silently skip — CI sandboxes may not support fs.watch
        }
    }
}
export const dsCache = new DSCache();
//# sourceMappingURL=cache.js.map