import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config";

export default defineConfig({
  ...viteConfig,
  test: {
    ...viteConfig.test,
    globals: false,
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
