import { resolve } from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

const demoRoot = resolve(__dirname, "examples");

export default defineConfig(({ command, mode }) => {
  const isDemo = command === "serve" || mode === "demo";

  if (isDemo) {
    return {
      root: demoRoot,
      plugins: [react()],
      resolve: {
        alias: {
          "@allystudio/usetemporal-react": resolve(__dirname, "src"),
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
          index: resolve(__dirname, "src/index.ts"),
          components: resolve(__dirname, "src/components/index.ts"),
        },
        formats: ["es"],
        fileName: (_format, entryName) =>
          entryName === "index" ? "index.js" : `${entryName}/index.js`,
      },
      rollupOptions: {
        external: [/^@allystudio\/usetemporal/, "react"],
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
      setupFiles: resolve(__dirname, "../../vitest.setup.ts"),
    },
  };
});
