import type { ConfigEnv, UserConfig } from "vite";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import vue from "@vitejs/plugin-vue";

const EXTERNAL = [/^@aleksejdix\/minuta/u, /^vue(?:\/.*)?$/u];

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
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": fromRoot("examples/src"),
      "@aleksejdix/minuta-vue": fromRoot("src"),
      "@aleksejdix/minuta-vue/components": fromRoot("src/components/index.ts"),
    },
  },
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
    vue(),
    dts({
      exclude: ["src/**/*.test.ts", "src/test/**"],
      include: ["src/**/*.ts", "src/**/*.vue"],
    }),
  ],
};

export default defineConfig(({ command, mode }: Readonly<ConfigEnv>) => {
  if (command === "serve" || mode === "demo") {
    return demoConfig;
  }
  return libraryConfig;
});
