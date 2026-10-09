import { ENTRIES, publicApi } from "./api-docs";
import { describe, expect, it } from "vitest";
import type { ExportDocs } from "./api-docs";

const NONE = 0;

function label(docs: ExportDocs): string {
  return `${docs.entry}: ${docs.name}`;
}

const EXPORTS = publicApi();
const ENTRIES_FOUND = new Set(EXPORTS.map((docs) => docs.entry));
const UNDESCRIBED = EXPORTS.filter((docs) => docs.description === "").map(
  (docs) => label(docs)
);
const WITHOUT_EXAMPLE = EXPORTS.filter(
  (docs) => docs.callable && docs.examples.length === NONE
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
