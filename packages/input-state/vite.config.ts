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
      external: ["text-buffer"],
    },
  },
  plugins: [
    dts({
      include: ["src/**/*.ts"],
      insertTypesEntry: true,
    }),
  ],
});
