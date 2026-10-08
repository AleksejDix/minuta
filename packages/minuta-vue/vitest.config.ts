import { defineConfig } from "vitest/config";
import path from "node:path";
import vue from "@vitejs/plugin-vue";

const CORE_SOURCE = path.resolve(import.meta.dirname, "../minuta/src");

function core(file: string): string {
  return path.resolve(CORE_SOURCE, file);
}

// Tests run against the core's source, not its build
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: /^minuta$/u, replacement: core("index.ts") },
      { find: /^minuta\/calendar$/u, replacement: core("calendar.ts") },
      { find: /^minuta\/core$/u, replacement: core("core.ts") },
      { find: /^minuta\/format$/u, replacement: core("format.ts") },
      { find: /^minuta\/native$/u, replacement: core("native.ts") },
    ],
  },
  test: {
    environment: "jsdom",
    globals: false,
    include: ["src/**/*.test.ts"],
    setupFiles: path.resolve(import.meta.dirname, "../../vitest.setup.ts"),
  },
});
