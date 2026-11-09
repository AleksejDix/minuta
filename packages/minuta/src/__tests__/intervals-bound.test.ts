import { createUnits, withUnits } from "#src/index";
import { date, text } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { range } from "#src/operations/index";

const edit = withUnits(createUnits({ timeZone: "UTC" }));

describe("withUnits(): interval functions", () => {
  it("moves date periods to dates once bound", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const span = range(date("2026-03-10"), date("2026-03-13"));
    const moved = edit.move(span, date("2026-04-01"));
    expect(text(moved)).toBe("2026-04-01/2026-04-04 custom");
  });

  it("rounds dates to dates once bound", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const snapped = edit.round(date("2026-03-18"), {
      roundingMode: "floor",
      smallestUnit: "week",
    });
    expect(snapped.toString()).toBe("2026-03-16");
  });
});
