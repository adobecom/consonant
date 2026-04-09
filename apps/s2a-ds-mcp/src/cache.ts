// src/cache.ts — In-memory cache with TTL + file-watch invalidation

import { watch, type FSWatcher } from "fs";

const TTL_MS = 30_000; // 30s local dev; override via CACHE_TTL_MS env

interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

class DSCache {
  private store = new Map<string, CacheEntry<unknown>>();
  private watchers = new Map<string, FSWatcher>();
  private ttl = Number(process.env.CACHE_TTL_MS ?? TTL_MS);

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key) as CacheEntry<T> | undefined;
    if (!entry) return undefined;
    if (Date.now() - entry.timestamp > this.ttl) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set<T>(key: string, value: T): void {
    this.store.set(key, { value, timestamp: Date.now() });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  /** Watch a directory; invalidate cacheKey on any change. Safe to call repeatedly. */
  watch(path: string, cacheKey: string): void {
    if (this.watchers.has(path)) return;
    try {
      const watcher = watch(path, { recursive: true, persistent: false }, () => {
        this.invalidate(cacheKey);
      });
      this.watchers.set(path, watcher);
    } catch {
      // Silently skip — CI sandboxes may not support fs.watch
    }
  }
}

export const dsCache = new DSCache();
