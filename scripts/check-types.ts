/**
 * Type-checks every published entry point the way a consumer's TypeScript
 * sees it: from the built declarations, without the monorepo's `source`
 * condition, under Node's own module resolution and a bundler's. A
 * declaration that imports what the package does not ship (a `#src/…`
 * subpath, an extensionless relative path under NodeNext) fails here, while
 * the monorepo's own type-check, which reads the source, passes.
 *
 * Run after the build with `npm run check:types`.
 */
// oxlint-disable typescript/prefer-readonly-parameter-types -- The compiler API's options and diagnostics are mutable objects
import { entryPoints } from "./entry-points.ts";
import path from "node:path";
import ts from "typescript";

const ROOT = path.resolve(import.meta.dirname, "..");
const PACKAGES = `${path.join(ROOT, "packages")}${path.sep}`;
// A consumer module next to the repo's node_modules, so the packages resolve
const CONSUMER = path.join(ROOT, "scripts", "types-consumer.mts");
const NONE = 0;
const FAILURE = 1;
const LINE_OFFSET = 1;

// A consumer's settings: strict, the declarations checked, no source condition
function settingsFor(
  module: ts.ModuleKind,
  moduleResolution: ts.ModuleResolutionKind
): ts.CompilerOptions {
  return {
    lib: ["lib.es2024.d.ts", "lib.dom.d.ts"],
    module,
    moduleResolution,
    noEmit: true,
    skipLibCheck: false,
    strict: true,
    target: ts.ScriptTarget.ES2022,
    types: [],
  };
}

const RESOLUTIONS: readonly (readonly [string, ts.CompilerOptions])[] = [
  [
    "NodeNext",
    settingsFor(ts.ModuleKind.NodeNext, ts.ModuleResolutionKind.NodeNext),
  ],
  [
    "Bundler",
    settingsFor(ts.ModuleKind.ESNext, ts.ModuleResolutionKind.Bundler),
  ],
];

// One namespace import per entry point; an unresolved one is an error
function consumerSource(specifiers: readonly string[]): string {
  const imports = specifiers.map(
    (specifier, index) =>
      `import * as entry${String(index)} from "${specifier}";`
  );
  const names = specifiers.map((_specifier, index) => `entry${String(index)}`);
  return `${imports.join("\n")}\nexport { ${names.join(", ")} };\n`;
}

// The consumer file and the packages' declarations; dependencies are theirs
function isOurs(diagnostic: ts.Diagnostic): boolean {
  const { file } = diagnostic;
  if (file === undefined) {
    return false;
  }
  return file.fileName === CONSUMER || file.fileName.startsWith(PACKAGES);
}

function describe(diagnostic: ts.Diagnostic): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  const { file, start } = diagnostic;
  if (file === undefined || start === undefined) {
    return message;
  }
  const { line } = file.getLineAndCharacterOfPosition(start);
  const where = path.relative(ROOT, file.fileName);
  return `${where}:${String(line + LINE_OFFSET)}: ${message}`;
}

// A compiler host that reads the consumer module from memory
function hostWith(
  settings: Readonly<ts.CompilerOptions>,
  source: string
): ts.CompilerHost {
  const host = ts.createCompilerHost(settings);
  const readFile = host.readFile.bind(host);
  const fileExists = host.fileExists.bind(host);
  host.readFile = (file): string | undefined => {
    if (file === CONSUMER) {
      return source;
    }
    return readFile(file);
  };
  host.fileExists = (file): boolean => file === CONSUMER || fileExists(file);
  return host;
}

function errorsUnder(
  name: string,
  settings: ts.CompilerOptions,
  source: string
): string[] {
  const program = ts.createProgram(
    [CONSUMER],
    settings,
    hostWith(settings, source)
  );
  return ts
    .getPreEmitDiagnostics(program)
    .filter((diagnostic) => isOurs(diagnostic))
    .map((diagnostic) => `${name}: ${describe(diagnostic)}`);
}

function report(failed: readonly string[], count: number): void {
  if (failed.length > NONE) {
    process.stderr.write(
      `${String(failed.length)} type errors in the published declarations:\n  ${failed.join("\n  ")}\n`
    );
    process.exitCode = FAILURE;
  } else {
    process.stdout.write(
      `The types of all ${String(count)} entry points resolve under NodeNext and Bundler.\n`
    );
  }
}

const specifiers = entryPoints();
const source = consumerSource(specifiers);
report(
  RESOLUTIONS.flatMap(([name, settings]) =>
    errorsUnder(name, settings, source)
  ),
  specifiers.length
);
