// node-fs.ts — `node:fs` for the browser: resolvable, never callable.
//
// The engine's tokens.mjs keeps its Node entry (loadShippedTokens reads a
// directory) in the same module as the pure resolver the Book uses. Importing
// the module pulls the fs binding along, and Vite's browser stub for node:fs
// throws when that binding is LINKED — before anything is called. So the
// bindings are given real functions here, each of which refuses by name if it
// is ever actually invoked: the Book must never read a file at runtime, and if
// a future engine change tries, this says so instead of silently returning "".
const refuse = (fn: string) => (): never => {
  throw new Error(`node:fs.${fn} is not available in the Contract Book — all repo data arrives through virtual:s2a-data at build time`);
};
export const readFileSync = refuse("readFileSync");
export const readdirSync = refuse("readdirSync");
export const existsSync = (): boolean => false;
export const writeFileSync = refuse("writeFileSync");
export const mkdirSync = refuse("mkdirSync");
export default { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync };
