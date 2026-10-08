import { resolve } from "node:path";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import dts from "vite-plugin-dts";

const demoRoot = resolve(import.meta.dirname, "examples");

export default defineConfig(({ command, mode }) => {
  const isDemo = command === "serve" || mode === "demo";

  if (isDemo) {
    return {
      root: demoRoot,
      plugins: [
        svelte({
          configFile: resolve(demoRoot, "svelte.config.js"),
        }),
      ],
      resolve: {
        alias: {
          "minuta-svelte": resolve(import.meta.dirname, "src"),
          "minuta-svelte/components": resolve(
            import.meta.dirname,
            "src/components/index.ts"
          ),
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
        external: [/^minuta/, "svelte"],
      },
    },
    plugins: [
      svelte(),
      dts({
        include: ["src/**/*.ts"],
        exclude: ["src/**/*.test.ts"],
      }),
    ],
    test: {
      environment: "node",
      setupFiles: resolve(import.meta.dirname, "../../vitest.setup.ts"),
    },
  };
});
