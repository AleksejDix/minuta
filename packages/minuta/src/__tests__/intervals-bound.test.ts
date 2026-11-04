import { date, text } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { createUnits } from "#src/create-units";
import { intervals } from "#src/intervals";
import { range } from "#src/operations/index";

const edit = intervals(createUnits({ timeZone: "UTC" }));

describe("intervals()", () => {
  it("moves date periods to dates once bound", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const span = range(date("2026-03-10"), date("2026-03-13"));
    const moved = edit.move(span, date("2026-04-01"));
    expect(text(moved)).toBe("2026-04-01/2026-04-04 custom");
  });

  it("snaps dates to dates once bound", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const snapped = edit.snap(date("2026-03-18"), "week", { mode: "floor" });
    expect(snapped.toString()).toBe("2026-03-16");
  });
});
