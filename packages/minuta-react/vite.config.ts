import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";
import react from "@vitejs/plugin-react";

const EXTERNAL = [/^minuta/u, /^react(?:\/.*)?$/u];

function fromRoot(file: string): string {
  return path.resolve(import.meta.dirname, file);
}

function fileName(_format: string, entryName: string): string {
  if (entryName === "index") {
    return "index.js";
  }
  return `${entryName}/index.js`;
}

const demoConfig: UserConfig = {
  build: { outDir: "dist" },
  plugins: [react()],
  resolve: { alias: { "minuta-react": fromRoot("src") } },
  root: fromRoot("examples"),
};

const libraryConfig: UserConfig = {
  build: {
    lib: {
      entry: {
        components: fromRoot("src/components/index.ts"),
        index: fromRoot("src/index.ts"),
      },
      fileName,
      formats: ["es"],
    },
    rollupOptions: { external: EXTERNAL },
  },
  plugins: [
    dts({
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx"],
      include: ["src/**/*.ts", "src/**/*.tsx"],
    }),
  ],
};

export default defineConfig(({ command, mode }: Readonly<ConfigEnv>) => {
  if (command === "serve" || mode === "demo") {
    return demoConfig;
  }
  return libraryConfig;
});
