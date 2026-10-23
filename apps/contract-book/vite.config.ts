// vite.config.ts — the Contract Book.
//
// The engine under packages/spec-dictionary is imported unchanged. Two things
// stand between it and a browser, and both are handled here rather than by
// forking the engine:
//   - `node:crypto` (canonical.mjs hashes a defs revision) -> a sync SHA-256 shim
//   - reading files off disk (tokens, evidence, schema) -> the s2a-data plugin,
//     which reads them at dev/build time into one virtual module
// So the Book and `npm run specs:build` run the same code on the same inputs.
//
// Two more plugins put Node-only steps behind dev-server endpoints, because a
// browser cannot drive Chromium or hold a Figma token:
//   - parity   screenshots the derived State matrix and scores it against the
//              golden sheet with evals/visual/matrix-parity.mjs
//   - extract  pulls a component set over the Figma REST API through the
//              toolkit's extractor and drafts its defs with the scaffolder
import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import s2aData from "./vite-plugin-s2a-data.mjs";
import parity from "./vite-plugin-parity.mjs";
import extract from "./vite-plugin-extract.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
// GitHub Pages hosts the Book at /consonant/contract-book/ as a read-only
// snapshot: the data is baked in at build time, but the extract, parity and
// save endpoints below are dev-server plugins and do not exist on a static host.
const pages = process.env.GITHUB_PAGES === "true";

export default defineConfig({
  root: here,
  base: pages ? process.env.CONTRACT_BOOK_BASE_PATH || "/consonant/contract-book/" : "/",
  define: { __BOOK_STATIC__: JSON.stringify(pages) },
  plugins: [s2aData({ root: repoRoot }), parity({ root: repoRoot }), extract({ root: repoRoot })],
  resolve: {
    alias: {
      "node:crypto": resolve(here, "src/shims/node-crypto.ts"),
      // tokens.mjs keeps its Node entry beside the pure resolver; the bindings
      // must link, and must refuse by name if ever called from the browser.
      "node:fs": resolve(here, "src/shims/node-fs.ts"),
      "node:path": resolve(here, "src/shims/node-path.ts"),
    },
  },
  server: {
    port: 6007,
    strictPort: true,
    // The engine lives outside the app folder; Vite must be allowed to serve it.
    fs: { allow: [repoRoot] },
  },
  build: {
    outDir: resolve(repoRoot, "dist", "apps", "contract-book"),
    emptyOutDir: true,
    rollupOptions: { input: { main: resolve(here, "index.html"), matrix: resolve(here, "matrix.html") } },
  },
});
