/// <reference types="node" />
import { ENTRIES, errorCodes, publicApi } from "./api-docs";
import { beforeAll, describe, expect, it } from "vitest";
import { readFile, writeFile } from "node:fs/promises";
import { renderLlms } from "./llms";

const LLMS_FILE = new URL("../../../llms.txt", import.meta.url);
const RENDERED = renderLlms(ENTRIES, publicApi(), errorCodes());

describe("llms.txt", () => {
  beforeAll(async () => {
    // `npm run docs:llms` regenerates the file
    if (import.meta.env["UPDATE_LLMS"] === "1") {
      await writeFile(LLMS_FILE, RENDERED);
    }
  });

  it("matches the public API", { timeout: 30_000 }, async () => {
    expect.hasAssertions();
    await expect(readFile(LLMS_FILE, "utf8")).resolves.toBe(RENDERED);
  });

  it("documents every entry", { timeout: 30_000 }, () => {
    expect.hasAssertions();
    expect(RENDERED).toContain("## `minuta/core`");
    expect(RENDERED).toContain("## Error codes");
  });
});
