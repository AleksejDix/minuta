import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    setupFiles: ["./vitest.setup.ts"],
    projects: [
      "packages/minuta",
      "packages/minuta-vue",
      "packages/minuta-react",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["packages/*/src/**/*.ts"],
      exclude: [
        "packages/*/src/**/*.test.ts",
        "packages/*/src/**/*.spec.ts",
        "packages/*/src/**/*.d.ts",
        "packages/*/dist/**",
        "packages/*/src/test/**",
        "packages/*/src/__tests__/**",
      ],
      // Collect coverage from all packages, not just the one being tested
      all: true,
    },
  },
});
