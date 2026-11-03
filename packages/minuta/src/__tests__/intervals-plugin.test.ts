import { date, text } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { intervals } from "#src/intervals";
import { temporalUnits } from "#src/temporal";
import { withUnits } from "#src/with-units";

const time = withUnits(temporalUnits({ timeZone: "UTC" }), {
  plugins: [intervals],
});

describe("the intervals plugin", () => {
  it("moves date periods to dates once bound", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const span = time.range(date("2026-03-10"), date("2026-03-13"));
    const moved = time.move(span, date("2026-04-01"));
    expect(text(moved)).toBe("2026-04-01/2026-04-04 custom");
  });

  it("snaps dates to dates once bound", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const snapped = time.snap(date("2026-03-18"), "week", { mode: "floor" });
    expect(snapped.toString()).toBe("2026-03-16");
  });
});
