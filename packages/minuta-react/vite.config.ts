import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

const demoRoot = resolve(import.meta.dirname, "examples");

export default defineConfig(({ command, mode }) => {
  const isDemo = command === "serve" || mode === "demo";

  if (isDemo) {
    return {
      root: demoRoot,
      plugins: [react()],
      resolve: {
        alias: {
          "minuta-react": resolve(import.meta.dirname, "src"),
        },
      },
      build: {
        outDir: "dist",
      },
    };
  }

  return {
    build: {
      lib: {
        entry: {
          index: resolve(import.meta.dirname, "src/index.ts"),
          components: resolve(import.meta.dirname, "src/components/index.ts"),
        },
        formats: ["es"],
        fileName: (_format, entryName) =>
          entryName === "index" ? "index.js" : `${entryName}/index.js`,
      },
      rollupOptions: {
        external: [/^minuta/, "react"],
      },
    },
    plugins: [
      dts({
        include: ["src/**/*.ts", "src/**/*.tsx"],
        exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      }),
    ],
    test: {
      environment: "jsdom",
      setupFiles: resolve(import.meta.dirname, "../../vitest.setup.ts"),
    },
  };
});
