/// <reference types="node" />
import { describe, expect, it } from "vitest";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { once } from "node:events";
import path from "node:path";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";

/*
 * The locale data must be what the generator makes from the installed
 * Unicode CLDR: regenerate into a temporary directory and compare.
 * `npm run data -w fechita` rewrites src/locales.
 */

const PACKAGE = new URL("../../", import.meta.url).pathname;
const LOCALES = path.join(PACKAGE, "src", "locales");
const SUCCESS = 0;

async function run(command: string, args: readonly string[]): Promise<void> {
  const child = spawn(command, [...args], { cwd: PACKAGE, stdio: "ignore" });
  const exit: readonly unknown[] = await once(child, "exit");
  const [code] = exit;
  if (code !== SUCCESS) {
    throw new Error(`${command} ${args.join(" ")} exited with ${String(code)}`);
  }
}

async function filesIn(
  directory: string
): Promise<Readonly<Record<string, string>>> {
  const names = await readdir(directory);
  names.sort();
  const entries = await Promise.all(
    names.map(
      async (name) =>
        [name, await readFile(path.join(directory, name), "utf8")] as const
    )
  );
  return Object.fromEntries(entries);
}

describe("locale data", () => {
  it("matches what Unicode CLDR generates", { timeout: 120_000 }, async () => {
    expect.hasAssertions();
    const out = await mkdtemp(path.join(tmpdir(), "fechita-locales-"));
    try {
      await run("node", ["scripts/build-locales.mjs", out]);
      await run("npx", ["oxfmt", out]);
      await expect(filesIn(out)).resolves.toStrictEqual(await filesIn(LOCALES));
    } finally {
      await rm(out, { force: true, recursive: true });
    }
  });
});
