import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  root: ".",
  resolve: {
    alias: {
      "@tokens": resolve(__dirname, "../../dist/packages/tokens/css/min/tokens.min.css"),
      "@components": resolve(__dirname, "../../packages/components/src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
