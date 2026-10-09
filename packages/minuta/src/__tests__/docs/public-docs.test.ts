import { describe, expect, it } from "vitest";
import ts from "typescript";

const SOURCE = new URL("../../", import.meta.url);
const NONE = 0;

const ENTRIES = [
  "index",
  "core",
  "calendar",
  "format",
  "native",
  "date-fns",
  "date-fns-tz",
  "dayjs",
  "luxon",
  "moment",
  "temporal",
];

const COMPILER_OPTIONS: ts.CompilerOptions = {
  customConditions: ["source"],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  skipLibCheck: true,
  strict: true,
  target: ts.ScriptTarget.ES2022,
};

type ExportDocs = Readonly<{
  callable: boolean;
  entry: string;
  hasDescription: boolean;
  hasExample: boolean;
  name: string;
}>;

function entryPath(entry: string): string {
  return new URL(`${entry}.ts`, SOURCE).pathname;
}

function hasFlag(flags: number, flag: number): boolean {
  // oxlint-disable-next-line eslint/no-bitwise -- TypeScript symbol flags are bit masks
  return (flags & flag) !== NONE;
}

function resolved(checker: ts.TypeChecker, symbol: ts.Symbol): ts.Symbol {
  if (!hasFlag(symbol.flags, ts.SymbolFlags.Alias)) {
    return symbol;
  }
  return checker.getAliasedSymbol(symbol);
}

function isCallable(checker: ts.TypeChecker, symbol: ts.Symbol): boolean {
  const declaration = symbol.valueDeclaration;
  if (declaration === undefined) {
    return false;
  }
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  return type.getCallSignatures().length > NONE;
}

function docsOf(
  checker: ts.TypeChecker,
  entry: string,
  exported: ts.Symbol
): ExportDocs {
  const target = resolved(checker, exported);
  const description = ts.displayPartsToString(
    target.getDocumentationComment(checker)
  );
  return {
    callable: isCallable(checker, target),
    entry,
    hasDescription: description.trim() !== "",
    hasExample: target
      .getJsDocTags(checker)
      .some((tag) => tag.name === "example"),
    name: exported.getName(),
  };
}

function exportsOf(
  program: ts.Program,
  checker: ts.TypeChecker,
  entry: string
): ExportDocs[] {
  const file = program.getSourceFile(entryPath(entry));
  if (file === undefined) {
    throw new Error(`Entry ${entry} was not loaded`);
  }
  const module = checker.getSymbolAtLocation(file);
  if (module === undefined) {
    throw new Error(`Entry ${entry} has no module symbol`);
  }
  return checker
    .getExportsOfModule(module)
    .map((exported) => docsOf(checker, entry, exported));
}

function label(docs: ExportDocs): string {
  return `${docs.entry}: ${docs.name}`;
}

const PROGRAM = ts.createProgram(
  ENTRIES.map((entry) => entryPath(entry)),
  COMPILER_OPTIONS
);
const CHECKER = PROGRAM.getTypeChecker();
const EXPORTS = ENTRIES.flatMap((entry) => exportsOf(PROGRAM, CHECKER, entry));
const ENTRIES_FOUND = new Set(EXPORTS.map((docs) => docs.entry));
const UNDESCRIBED = EXPORTS.filter((docs) => !docs.hasDescription).map((docs) =>
  label(docs)
);
const WITHOUT_EXAMPLE = EXPORTS.filter(
  (docs) => docs.callable && !docs.hasExample
).map((docs) => label(docs));

describe("public API documentation", () => {
  it("finds the exports of every entry", { timeout: 30_000 }, () => {
    expect.hasAssertions();
    expect(ENTRIES_FOUND).toStrictEqual(new Set(ENTRIES));
  });

  it("describes every export", { timeout: 30_000 }, () => {
    expect.hasAssertions();
    expect(UNDESCRIBED).toStrictEqual([]);
  });

  it("gives every exported function an @example", { timeout: 30_000 }, () => {
    expect.hasAssertions();
    expect(WITHOUT_EXAMPLE).toStrictEqual([]);
  });
});
