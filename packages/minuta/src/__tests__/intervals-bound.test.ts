import { createUnits, withUnits } from "#src/index";
import { describe, expect, it } from "vitest";
import { date } from "#src/test/temporal";

const edit = withUnits(createUnits({ timeZone: "UTC" }));

describe("withUnits(): interval functions", () => {
  it("rounds dates to dates once bound", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const snapped = edit.round(date("2026-03-18"), {
      roundingMode: "floor",
      smallestUnit: "week",
    });
    expect(snapped.toString()).toBe("2026-03-16");
  });
});
