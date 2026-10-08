import type { ConfigEnv } from "vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";

const demoRoot = path.resolve(import.meta.dirname, "examples");

export default defineConfig(({ command, mode }: Readonly<ConfigEnv>) => {
  if (command === "serve" || mode === "demo") {
    return { build: { outDir: "dist" }, root: demoRoot };
  }
  return {
    build: {
      lib: {
        entry: { index: path.resolve(import.meta.dirname, "src/index.ts") },
        formats: ["es"],
      },
      rollupOptions: {
        external: ["input-state"],
      },
    },
    plugins: [
      dts({
        include: ["src/**/*.ts"],
        insertTypesEntry: true,
      }),
    ],
  };
});
