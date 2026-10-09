import { describe, expect, expectTypeOf, it } from "vitest";
import type { MonthGrid } from "#src/calendar";
import type { Units } from "#src/types";
import { calendar } from "#src/calendar";
import { nativeUnits } from "#src/native";
import { withUnits } from "#src/core";

const SUNDAY = 0;
const WEEK_DAYS = 7;
const FIRST = 0;

const units = nativeUnits({ weekStartsOn: SUNDAY });
const workdays = {
  workdaysIn: (_units: Units, date: Readonly<Date>): Readonly<Date> => date,
};

describe("withUnits()", () => {
  it("exposes the units it was built with", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(withUnits(units).units).toBe(units);
  });

  it("binds plugin functions to the same units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const time = withUnits(units, { plugins: [calendar] });
    const grid = time.monthGrid(new Date("2026-03-15T12:00"));
    expectTypeOf(time.monthGrid).toEqualTypeOf<
      (date: Readonly<Date>) => MonthGrid
    >();
    // The grid follows the units' Sunday week start
    const weekdays = grid.periods.map((day) => day.start.getDay());
    expect(weekdays.indexOf(SUNDAY)).toBe(FIRST);
  });

  it("merges several plugins", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const time = withUnits(units, { plugins: [calendar, workdays] });
    expectTypeOf(time).toHaveProperty("workdaysIn");
    expectTypeOf(time).toHaveProperty("yearGrid");
    expect(Object.keys(time)).toContain("workdaysIn");
  });

  it("rejects plugin members that clash", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const clashing = { next: (_units: Units): number => WEEK_DAYS };
    const twice = [workdays, workdays] as const;
    // @ts-expect-error -- `next` is already an operation
    expect(() => withUnits(units, { plugins: [clashing] })).not.toThrow();
    // @ts-expect-error -- `workdaysIn` comes from two plugins
    expect(() => withUnits(units, { plugins: twice })).not.toThrow();
  });
});
