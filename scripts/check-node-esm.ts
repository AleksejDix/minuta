/**
 * Imports every published entry point of every package in plain Node, the
 * way a server-side user would. Bundlers resolve imports Node's ESM resolver
 * rejects (e.g. a dependency subpath without `.js`), so the test suite alone
 * cannot catch them.
 *
 * Run after the build with `npm run check:node-esm`.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const PACKAGES = path.resolve(import.meta.dirname, "../packages");
const WILDCARD = "*";
const JS = ".js";
const NONE = 0;
const FAILURE = 1;

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

// The file an export condition map imports, e.g. `./dist/core.js`
function importTarget(target: unknown): string | undefined {
  if (typeof target === "string") {
    return target;
  }
  if (isRecord(target) && typeof target["import"] === "string") {
    return target["import"];
  }
  return undefined;
}

// The subpaths a wildcard export such as `./locales/*` stands for
function expand(dir: string, subpath: string, target: string): string[] {
  if (!subpath.includes(WILDCARD)) {
    return [subpath];
  }
  const [prefix = "", suffix = ""] = target.split(WILDCARD);
  return readdirSync(path.join(PACKAGES, dir, prefix))
    .filter((file) => file.endsWith(suffix))
    .map((file) => subpath.replace(WILDCARD, file.slice(NONE, -suffix.length)));
}

function exportsOf(
  manifest: Readonly<Record<string, unknown>>
): Readonly<Record<string, unknown>> {
  const { exports } = manifest;
  if (isRecord(exports)) {
    return exports;
  }
  return {};
}

function specifiers(dir: string): string[] {
  const manifest: unknown = JSON.parse(
    readFileSync(path.join(PACKAGES, dir, "package.json"), "utf8")
  );
  if (!isRecord(manifest) || typeof manifest["name"] !== "string") {
    return [];
  }
  const { name } = manifest;
  return Object.entries(exportsOf(manifest)).flatMap(
    ([subpath, target]: readonly [string, unknown]) => {
      const file = importTarget(target);
      if (file === undefined || !file.endsWith(JS)) {
        return [];
      }
      return expand(dir, subpath, file).map((sub) =>
        path.posix.join(name, sub)
      );
    }
  );
}

async function failures(): Promise<string[]> {
  const all = readdirSync(PACKAGES).flatMap((dir) => specifiers(dir));
  const results = await Promise.allSettled(
    all.map(async (specifier): Promise<unknown> => {
      const module: unknown = await import(specifier);
      return module;
    })
  );
  return results.flatMap(
    (result: Readonly<PromiseSettledResult<unknown>>, index) => {
      if (result.status === "fulfilled") {
        return [];
      }
      return [`${all[index] ?? ""}: ${String(result.reason)}`];
    }
  );
}

function report(failed: readonly string[]): void {
  if (failed.length > NONE) {
    process.stderr.write(
      `${String(failed.length)} entry points fail to import in Node:\n  ${failed.join("\n  ")}\n`
    );
    process.exitCode = FAILURE;
  } else {
    process.stdout.write("Every entry point imports in plain Node.\n");
  }
}

report(await failures());
