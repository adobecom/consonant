// node-path.ts — `node:path` for the browser. join/dirname/resolve are pure
// string functions and safe to provide for real; the engine only ever joins
// paths it is about to hand to fs, which the fs shim refuses anyway.
export const join = (...parts: string[]): string => parts.filter(Boolean).join("/").replace(/\/+/g, "/");
export const resolve = (...parts: string[]): string => join(...parts);
export const dirname = (p: string): string => p.replace(/\/[^/]*$/, "") || "/";
export const basename = (p: string): string => p.replace(/^.*\//, "");
export default { join, resolve, dirname, basename };
