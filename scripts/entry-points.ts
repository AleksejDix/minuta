/**
 * The published entry points of every package: `name/subpath` for each
 * export with a `.js` import target, wildcards expanded.
 */
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const PACKAGES = path.resolve(import.meta.dirname, "../packages");
const WILDCARD = "*";
const JS = ".js";
const NONE = 0;

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

/**
 * Every published entry point of every package.
 *
 * @returns Specifiers such as `@aleksejdix/minuta/temporal`
 */
function entryPoints(): string[] {
  return readdirSync(PACKAGES).flatMap((dir) => specifiers(dir));
}

export { entryPoints };
