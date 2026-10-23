import { defineConfig } from "vitest/config";
export default defineConfig({
  test: {
    include: ["apps/authoring-poc/src/**/*.test.ts"],
    environment: "node",
  },
});
