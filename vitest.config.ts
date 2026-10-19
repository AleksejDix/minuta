import { defaultClientConditions, defaultServerConditions } from "vite";
import type { TestProjectInlineConfiguration } from "vitest/config";
import { defineConfig } from "vitest/config";

/*
 * Tests import the other workspace packages from their sources, through the
 * `@minuta/source` export condition, so they never run against a stale or
 * missing dist build. Builds and published packages keep using dist.
 */
const SOURCE = "@minuta/source";

// Each package and the config its tests use
const PACKAGES: readonly (readonly [string, string])[] = [
  ["minuta", "vite.config.ts"],
  ["minuta-vue", "vitest.config.ts"],
  ["minuta-react", "vitest.config.ts"],
  ["datefield", "vite.config.ts"],
  ["text-buffer", "vite.config.ts"],
  ["input-state", "vite.config.ts"],
  ["input-dom", "vitest.config.ts"],
  ["fechita", "vite.config.ts"],
];

// A package's own config, plus the condition
function project(name: string, config: string): TestProjectInlineConfiguration {
  const dir = `./packages/${name}`;
  return {
    extends: `${dir}/${config}`,
    resolve: { conditions: [SOURCE, ...defaultClientConditions] },
    ssr: { resolve: { conditions: [SOURCE, ...defaultServerConditions] } },
    test: { name, root: dir },
  };
}

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
    /*
     * Central European time unless the run sets TZ: UTC has no DST and hides
     * zone bugs. Setting TZ lets the CI time-zone matrix take effect.
     */
    env: { TZ: process.env["TZ"] ?? "Europe/Zurich" },
    onConsoleLog: (log) =>
      !EXPECTED_REACT_ERRORS.some((message) => log.includes(message)),
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    projects: PACKAGES.map(([name, config]) => project(name, config)),
    setupFiles: ["./vitest.setup.ts"],
  },
});
