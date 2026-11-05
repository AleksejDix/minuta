import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";

export default defineConfig({
  build: {
    lib: {
      entry: { index: path.resolve(import.meta.dirname, "src/index.ts") },
      formats: ["es"],
    },
    rollupOptions: {
      external: ["@aleksejdix/input-state", "@aleksejdix/text-buffer"],
    },
  },
  plugins: [
    dts({
      include: ["src/**/*.ts"],
      insertTypesEntry: true,
    }),
  ],
  test: {
    // Temporal on globalThis before any test, for the Temporal functions
    setupFiles: [path.resolve(import.meta.dirname, "../../vitest.setup.ts")],
  },
});
