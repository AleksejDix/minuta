/*
 * The public API as the TypeScript compiler sees it: every export of every
 * entry with its signature, description and examples. Shared by the docs
 * tests and the llms.txt generator.
 */

import ts from "typescript";

const SOURCE = new URL("../../", import.meta.url);
const NONE = 0;

/** Package entry points, in the order they are documented. */
const ENTRIES: readonly string[] = [
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
  description: string;
  entry: string;
  examples: readonly string[];
  name: string;
  signatures: readonly string[];
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

type FindFunction = (name: string) => ts.SignatureDeclaration | undefined;

function signatureText(
  name: string,
  declaration: ts.SignatureDeclaration,
  skipFirst: boolean
): string {
  const parameters = declaration.parameters.map((parameter) =>
    parameter.getText()
  );
  if (skipFirst) {
    parameters.shift();
  }
  const signature = `${name}(${parameters.join(", ")})`;
  if (declaration.type === undefined) {
    return signature;
  }
  return `${signature}: ${declaration.type.getText()}`;
}

function functionDeclarations(symbol: ts.Symbol): ts.SignatureDeclaration[] {
  const declarations = symbol.declarations ?? [];
  return declarations.filter((declaration) =>
    ts.isFunctionDeclaration(declaration)
  );
}

function boundSignatures(name: string, findCore: FindFunction): string[] {
  // A bound function of the default entry is its `…With` sibling without units
  const sibling = findCore(`${name}With`);
  if (sibling === undefined) {
    return [];
  }
  return [signatureText(name, sibling, true)];
}

function declaredText(symbol: ts.Symbol, name: string): string[] {
  const [declaration] = symbol.declarations ?? [];
  if (declaration === undefined) {
    return [];
  }
  if (ts.isTypeAliasDeclaration(declaration)) {
    return [declaration.getText()];
  }
  if (ts.isVariableDeclaration(declaration) && declaration.type !== undefined) {
    return [`const ${name}: ${declaration.type.getText()}`];
  }
  return [];
}

function signaturesOf(
  symbol: ts.Symbol,
  name: string,
  findCore: FindFunction
): string[] {
  const bound = boundSignatures(name, findCore);
  if (bound.length > NONE) {
    return bound;
  }
  const functions = functionDeclarations(symbol).map((declaration) =>
    signatureText(name, declaration, false)
  );
  if (functions.length > NONE) {
    return functions;
  }
  return declaredText(symbol, name);
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
  context: Readonly<{ entry: string; findCore: FindFunction }>,
  exported: ts.Symbol
): ExportDocs {
  const { entry, findCore } = context;
  const target = resolved(checker, exported);
  const name = exported.getName();
  return {
    callable: isCallable(checker, target),
    description: ts
      .displayPartsToString(target.getDocumentationComment(checker))
      .trim(),
    entry,
    examples: target
      .getJsDocTags(checker)
      .filter((tag) => tag.name === "example")
      .map((tag) => ts.displayPartsToString(tag.text).trim()),
    name,
    signatures: signaturesOf(target, name, findCore),
  };
}

function moduleExports(
  program: ts.Program,
  checker: ts.TypeChecker,
  entry: string
): ts.Symbol[] {
  const file = program.getSourceFile(entryPath(entry));
  if (file === undefined) {
    throw new Error(`Entry ${entry} was not loaded`);
  }
  const module = checker.getSymbolAtLocation(file);
  if (module === undefined) {
    throw new Error(`Entry ${entry} has no module symbol`);
  }
  return checker.getExportsOfModule(module);
}

function coreFunctionsOf(
  program: ts.Program,
  checker: ts.TypeChecker
): FindFunction {
  const functions = new Map<string, ts.SignatureDeclaration>();
  for (const exported of moduleExports(program, checker, "core")) {
    const [declaration] = functionDeclarations(resolved(checker, exported));
    if (declaration !== undefined) {
      functions.set(exported.getName(), declaration);
    }
  }
  return (name) => functions.get(name);
}

type ErrorCode = Readonly<{
  code: string;
  description: string;
}>;

function errorCodesOf(checker: ts.TypeChecker, errors: ts.Symbol): ErrorCode[] {
  const declaration = errors.valueDeclaration;
  if (declaration === undefined) {
    return [];
  }
  return checker
    .getTypeOfSymbolAtLocation(errors, declaration)
    .getProperties()
    .map((property) => ({
      code: checker
        .typeToString(checker.getTypeOfSymbol(property))
        .replaceAll('"', ""),
      description: ts
        .displayPartsToString(property.getDocumentationComment(checker))
        .trim(),
    }));
}

/**
 * The `MinutaError` codes with the meaning documented on each.
 *
 * @returns Every error code and its description
 */
function errorCodes(): ErrorCode[] {
  const program = ts.createProgram([entryPath("core")], COMPILER_OPTIONS);
  const checker = program.getTypeChecker();
  const errors = moduleExports(program, checker, "core").find(
    (exported) => exported.getName() === "MinutaError"
  );
  if (errors === undefined) {
    throw new Error("minuta/core does not export MinutaError");
  }
  return errorCodesOf(checker, resolved(checker, errors));
}

/**
 * Every export of every entry, with its documentation.
 *
 * @returns The documented exports, entry by entry
 */
function publicApi(): ExportDocs[] {
  const program = ts.createProgram(
    ENTRIES.map((entry) => entryPath(entry)),
    COMPILER_OPTIONS
  );
  const checker = program.getTypeChecker();
  const findCore = coreFunctionsOf(program, checker);
  return ENTRIES.flatMap((entry) =>
    moduleExports(program, checker, entry).map((exported) =>
      docsOf(checker, { entry, findCore }, exported)
    )
  );
}

export { ENTRIES, errorCodes, publicApi };
export type { ErrorCode, ExportDocs };
