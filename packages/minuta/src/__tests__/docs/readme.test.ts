/// <reference types="node" />
/// <reference types="vite/client" />
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import README from "#readme?raw";
import path from "node:path";
import { tmpdir } from "node:os";
import ts from "typescript";

const SOURCE = new URL("../../", import.meta.url).pathname;
const CODE_BLOCK = /```ts\n(?<code>[\s\S]*?)```/gu;
const IMPORT_FROM = /from "(?<specifier>minuta(?:\/[a-z-]+)?)"/gu;

const ENTRY_FILES: Readonly<Record<string, string>> = {
  minuta: "index",
  "minuta/calendar": "calendar",
  "minuta/core": "core",
  "minuta/date-fns": "date-fns",
  "minuta/date-fns-tz": "date-fns-tz",
  "minuta/dayjs": "dayjs",
  "minuta/format": "format",
  "minuta/luxon": "luxon",
  "minuta/moment": "moment",
  "minuta/native": "native",
  "minuta/temporal": "temporal",
};

const COMPILER_OPTIONS: ts.CompilerOptions = {
  allowImportingTsExtensions: true,
  customConditions: ["source"],
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  skipLibCheck: true,
  strict: true,
  target: ts.ScriptTarget.ES2022,
};

/**
 * Point the package imports of a README example at the source entries.
 *
 * @param code - The example as written in the README
 * @returns The example importing from the source files
 */
function toSourceImports(code: string): string {
  return code.replaceAll(IMPORT_FROM, (_match, specifier: string) => {
    const file = ENTRY_FILES[specifier];
    if (file === undefined) {
      throw new Error(`README imports unknown entry ${specifier}`);
    }
    return `from "${path.join(SOURCE, `${file}.ts`)}"`;
  });
}

function codeBlocks(markdown: string): string[] {
  const blocks: string[] = [];
  for (const match of markdown.matchAll(CODE_BLOCK)) {
    const { groups } = match;
    if (groups !== undefined) {
      blocks.push(groups["code"] ?? "");
    }
  }
  return blocks;
}

function diagnosticText(diagnostic: ts.Diagnostic): string {
  const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
  if (diagnostic.file === undefined) {
    return message;
  }
  return `${path.basename(diagnostic.file.fileName)}: ${message}`;
}

// Filled by beforeAll: where the examples are written, and their type errors
const checked: { directory: string; typeErrors: string[] } = {
  directory: "",
  typeErrors: [],
};

const BLOCKS = codeBlocks(README);
const EXAMPLES = BLOCKS.map((_code, index) => `example-${String(index)}.ts`);

function typeErrorsIn(files: readonly string[]): string[] {
  const program = ts.createProgram(files, COMPILER_OPTIONS);
  return ts
    .getPreEmitDiagnostics(program)
    .filter(
      (diagnostic) =>
        diagnostic.file !== undefined &&
        files.includes(diagnostic.file.fileName)
    )
    .map((diagnostic) => diagnosticText(diagnostic));
}

describe("readme examples", () => {
  beforeAll(async () => {
    checked.directory = await mkdtemp(path.join(tmpdir(), "minuta-readme-"));
    const files = EXAMPLES.map((name) => path.join(checked.directory, name));
    await Promise.all(
      BLOCKS.map(async (code, index) => {
        await writeFile(
          path.join(checked.directory, `example-${String(index)}.ts`),
          `${toSourceImports(code)}\nexport {};\n`
        );
      })
    );
    checked.typeErrors = typeErrorsIn(files);
  });

  afterAll(async () => {
    await rm(checked.directory, { force: true, recursive: true });
  });

  it("has examples to check", { timeout: 30_000 }, () => {
    expect.hasAssertions();
    expect(EXAMPLES).not.toStrictEqual([]);
  });

  it("type-check against the source", { timeout: 30_000 }, () => {
    expect.hasAssertions();
    expect(checked.typeErrors).toStrictEqual([]);
  });

  it.each(EXAMPLES)(
    "%s runs without throwing",
    { timeout: 30_000 },
    async (name) => {
      expect.hasAssertions();
      await expect(
        import(path.join(checked.directory, name))
      ).resolves.toBeDefined();
    }
  );
});
