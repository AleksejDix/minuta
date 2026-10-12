import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(import.meta.dirname, "examples/src") },
  },
  test: {
    environment: "jsdom",
    globals: false,
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "examples/src/**/*.test.tsx",
    ],
    setupFiles: [
      path.resolve(import.meta.dirname, "../../vitest.setup.ts"),
      path.resolve(import.meta.dirname, "vitest.setup.ts"),
    ],
  },
});
