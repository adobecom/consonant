import { defineConfig } from "vite";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = resolve(fileURLToPath(import.meta.url), "..");

export default defineConfig({
  root: __dirname,
  resolve: {
    alias: {
      "@tokens": resolve(__dirname, "../../dist/packages/tokens/css/min/tokens.min.css"),
      "@components": resolve(__dirname, "../../packages/components/src"),
    },
  },
  server: {
    port: 5173,
    open: false,
    fs: {
      allow: ["."],
    },
  },
});
