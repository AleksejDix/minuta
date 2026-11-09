/**
 * Declaration files that resolve wherever a consumer's TypeScript reads
 * them. `vite-plugin-dts` keeps the import paths of the source:
 *
 * - `#src/…` subpaths resolve only through the package's `imports` map, and
 *   not at all under a `source` condition, which points at files the package
 *   does not ship;
 * - relative paths without an extension do not resolve under NodeNext.
 *
 * - a `.vue` component, declared in `x.vue.d.ts`, does not resolve under
 *   NodeNext as `./x.vue`.
 *
 * This rewrites them to relative paths ending in `.js` (`/index.js` for a
 * directory, `x.vue.js` for a component), which TypeScript reads as the
 * `.d.ts` next to them.
 */
import { existsSync } from "node:fs";
import path from "node:path";

type WrittenFile = Readonly<{ content: string; filePath: string }>;

// The specifier of a static or dynamic import or an export … from, in either quote style
const SPECIFIER =
  /(?<keyword>\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(?<quote>["'])(?<specifier>#src\/[^"']+|\.{1,2}\/[^"']*)\k<quote>/gu;
const SOURCE_EXTENSIONS: readonly string[] = [".ts", ".tsx"];
const SUBPATH = "#src/";
const VUE = ".vue";

// A relative specifier: `./x` for a file in the same directory
function dotted(relative: string): string {
  if (relative.startsWith(".")) {
    return relative;
  }
  return `./${relative}`;
}

function isSourceFile(base: string): boolean {
  return SOURCE_EXTENSIONS.some((extension) =>
    existsSync(`${base}${extension}`)
  );
}

/**
 * The specifier with the ending NodeNext needs, judged by the source file it
 * was compiled from.
 *
 * @param specifier - A relative specifier from a declaration file
 * @param source - Where the declaration's directory lies in the source
 * @returns The specifier ending in `.js` or `/index.js`, or as it was
 */
function withEnding(specifier: string, source: string): string {
  const base = path.join(source, specifier);
  // A component `x.vue` is declared in `x.vue.d.ts`, which `x.vue.js` names
  if (isSourceFile(base) || (base.endsWith(VUE) && existsSync(base))) {
    return `${specifier}.js`;
  }
  if (isSourceFile(path.join(base, "index"))) {
    return `${specifier}/index.js`;
  }
  return specifier;
}

// `#src/x` as a path relative to the declaration; other specifiers as they are
function relativeOf(
  specifier: string,
  source: string,
  sourceDir: string
): string {
  if (!specifier.startsWith(SUBPATH)) {
    return specifier;
  }
  const target = path.join(sourceDir, specifier.slice(SUBPATH.length));
  return dotted(path.relative(source, target).replaceAll(path.sep, "/"));
}

// One import with its specifier rewritten
function rewritten(match: string, source: string, sourceDir: string): string {
  const found = new RegExp(SPECIFIER.source, "u").exec(match);
  if (found === null || found.groups === undefined) {
    return match;
  }
  const { groups } = found;
  const { keyword = "", quote = "", specifier = "" } = groups;
  const relative = relativeOf(specifier, source, sourceDir);
  return `${keyword}${quote}${withEnding(relative, source)}${quote}`;
}

/**
 * A `beforeWriteFile` hook for `vite-plugin-dts`: every `#src/x` and every
 * extensionless relative import becomes a relative path ending in `.js`.
 *
 * @param root - The package directory: sources in `src`, declarations in `dist`
 * @returns The hook
 */
function relativeTypes(
  root: string
): (filePath: string, content: string) => WrittenFile {
  const outDir = path.join(root, "dist");
  const sourceDir = path.join(root, "src");
  return (filePath, content) => {
    const directory = path.dirname(filePath);
    const source = path.join(sourceDir, path.relative(outDir, directory));
    return {
      content: content.replaceAll(SPECIFIER, (match: string) =>
        rewritten(match, source, sourceDir)
      ),
      filePath,
    };
  };
}

export { relativeTypes };
