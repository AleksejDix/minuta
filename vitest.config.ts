import { defineConfig } from "vitest/config";

// React logs these when a test expects a render to throw
const EXPECTED_REACT_ERRORS = [
  "Consider adding an error boundary",
  "The above error occurred",
];

export default defineConfig({
  test: {
    coverage: {
      // Collect coverage from all packages, not just the one being tested
      all: true,
      exclude: [
        "packages/*/src/**/*.test.ts",
        "packages/*/src/**/*.spec.ts",
        "packages/*/src/**/*.d.ts",
        "packages/*/dist/**",
        "packages/*/src/test/**",
        "packages/*/src/__tests__/**",
      ],
      include: ["packages/*/src/**/*.ts"],
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
    // UTC unless the run sets TZ, so the CI time-zone matrix takes effect
    env: { TZ: process.env["TZ"] ?? "UTC" },
    onConsoleLog: (log) =>
      !EXPECTED_REACT_ERRORS.some((message) => log.includes(message)),
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    projects: [
      "packages/minuta",
      "packages/minuta-vue",
      "packages/minuta-react",
      "packages/datefield",
      "packages/text-buffer",
      "packages/input-state",
      "packages/input-dom",
    ],
    setupFiles: ["./vitest.setup.ts"],
  },
});
