import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
export default defineConfig({
  root,
  base: process.env.AUTHORING_BASE_PATH || "./",
  server: { host: "127.0.0.1", port: 4400 },
  build: {
    target: "es2022",
    outDir: "../../dist/apps/authoring-poc",
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: { studio: `${root}index.html`, preview: `${root}preview.html` },
    },
  },
});
