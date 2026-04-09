declare class DSCache {
    private store;
    private watchers;
    private ttl;
    get<T>(key: string): T | undefined;
    set<T>(key: string, value: T): void;
    invalidate(key: string): void;
    /** Watch a directory; invalidate cacheKey on any change. Safe to call repeatedly. */
    watch(path: string, cacheKey: string): void;
}
export declare const dsCache: DSCache;
export {};
//# sourceMappingURL=cache.d.ts.map