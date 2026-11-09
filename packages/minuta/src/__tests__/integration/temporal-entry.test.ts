import { describe, expect, it } from "vitest";
import { createUnits } from "#src/index";
import { temporalReady } from "#src/temporal";

const UNIT_NAMES: readonly string[] = [
  "day",
  "hour",
  "minute",
  "month",
  "quarter",
  "second",
  "week",
  "year",
];

const SETTINGS: readonly string[] = ["timeZone", "weekStartsOn", "weekend"];

describe("export verification: the temporal entry", () => {
  it("exports temporalReady, nothing else", { timeout: 5000 }, async () => {
    expect.hasAssertions();
    const entry: object = await import("#src/temporal");
    expect(new Set(Object.keys(entry))).toStrictEqual(
      new Set(["temporalReady"])
    );
    expect(Reflect.get(entry, "temporalReady")).toBe(temporalReady);
  });
});

describe("createUnits()", () => {
  it("makes a spec for every unit, and the settings", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const names = Object.keys(createUnits());
    expect(new Set(names)).toStrictEqual(new Set([...UNIT_NAMES, ...SETTINGS]));
  });
});
