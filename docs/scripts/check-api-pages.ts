/**
 * Fails when a public export has no reference page. Every value an entry
 * point exports (functions, components, error constants) needs a page named
 * after it under `src/content/docs/api/`.
 *
 * Run with `npm run check:api -w minuta-docs`.
 */
import { existsSync, readdirSync } from "node:fs";
import type { Dirent } from "node:fs";
import path from "node:path";
import ts from "typescript";

type Entry = Readonly<{ docs: string; file: string; pkg: string }>;

const ROOT = path.resolve(import.meta.dirname, "../..");
const API = path.resolve(import.meta.dirname, "../src/content/docs/api");
const FAILURE = 1;
// A page is Markdown or MDX
const PAGE = /\.mdx?$/u;
const NONE = 0;

const ADAPTERS = [
  "native",
  "date-fns",
  "date-fns-tz",
  "luxon",
  "dayjs",
  "moment",
  "temporal",
];

const ENTRIES: readonly Entry[] = [
  { docs: "minuta", file: "index", pkg: "minuta" },
  { docs: "minuta-core", file: "core", pkg: "minuta" },
  { docs: "minuta-calendar", file: "calendar", pkg: "minuta" },
  { docs: "minuta-intervals", file: "intervals", pkg: "minuta" },
  { docs: "minuta-format", file: "format", pkg: "minuta" },
  ...ADAPTERS.map((file) => ({ docs: "adapters", file, pkg: "minuta" })),
  { docs: "minuta-react", file: "index", pkg: "minuta-react" },
  { docs: "minuta-react", file: "components/index", pkg: "minuta-react" },
  { docs: "minuta-vue", file: "index", pkg: "minuta-vue" },
  { docs: "minuta-vue", file: "components/index", pkg: "minuta-vue" },
  { docs: "datefield", file: "index", pkg: "datefield" },
  { docs: "input-dom", file: "index", pkg: "input-dom" },
  { docs: "input-state", file: "index", pkg: "input-state" },
  { docs: "text-buffer", file: "index", pkg: "text-buffer" },
  { docs: "fechita", file: "index", pkg: "fechita" },
  { docs: "fechita", file: "core", pkg: "fechita" },
];

function entryPath(entry: Entry): string {
  return path.join(ROOT, "packages", entry.pkg, "src", `${entry.file}.ts`);
}

// `divideWith` → `divide-with`, `MinutaError` → `minuta-error`
function kebabCase(name: string): string {
  return name
    .replaceAll(/(?<lower>[a-z0-9])(?<upper>[A-Z])/gu, "$<lower>-$<upper>")
    .toLowerCase();
}

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- The TypeScript compiler's checker and source files are mutable objects
function valueExports(checker: ts.TypeChecker, file: ts.SourceFile): string[] {
  const module = checker.getSymbolAtLocation(file);
  if (module === undefined) {
    return [];
  }
  return checker
    .getExportsOfModule(module)
    .filter((symbol) => {
      const target = checker.getAliasedSymbol(symbol);
      // oxlint-disable-next-line no-bitwise -- TypeScript's symbol flags are a bit set
      const value: number = target.flags & ts.SymbolFlags.Value;
      return value !== NONE;
    })
    .map((symbol) => symbol.name);
}

// Pages anywhere under api/, so a re-export documented once is enough
function allPages(): ReadonlySet<string> {
  return new Set(
    readdirSync(API, { recursive: true, withFileTypes: true })
      .filter(
        (dirent: Readonly<Dirent>) => dirent.isFile() && PAGE.test(dirent.name)
      )
      .map((dirent: Readonly<Dirent>) => dirent.name.replace(PAGE, ""))
  );
}

function missingPages(
  program: ts.Program,
  pages: ReadonlySet<string>
): string[] {
  const checker = program.getTypeChecker();
  return ENTRIES.flatMap((entry) => {
    const file = program.getSourceFile(entryPath(entry));
    if (file === undefined) {
      return [`${entry.pkg}/${entry.file}: entry point not found`];
    }
    return valueExports(checker, file)
      .filter((name) => {
        const own = path.join(API, entry.docs, kebabCase(name));
        return (
          !existsSync(`${own}.md`) &&
          !existsSync(`${own}.mdx`) &&
          !pages.has(kebabCase(name))
        );
      })
      .map((name) => `api/${entry.docs}/${kebabCase(name)}.md (${name})`);
  });
}

const program = ts.createProgram({
  options: {
    allowImportingTsExtensions: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    noEmit: true,
    skipLibCheck: true,
    target: ts.ScriptTarget.ES2022,
  },
  rootNames: [
    ...ENTRIES.map((entry) => entryPath(entry)),
    path.join(ROOT, "packages/minuta-vue/src/env.d.ts"),
  ],
});

const missing = missingPages(program, allPages());
if (missing.length > NONE) {
  process.stderr.write(
    `Reference pages missing for ${String(missing.length)} exports:\n  ${missing.join("\n  ")}\n`
  );
  process.exitCode = FAILURE;
} else {
  process.stdout.write("Every public export has a reference page.\n");
}
