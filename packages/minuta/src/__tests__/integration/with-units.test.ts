import type { DatePeriod, PlainDate, Units } from "#src/types";
import { date, zoned } from "#src/test/temporal";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { MonthGrid } from "#src/calendar";
import { calendar } from "#src/calendar";
import { temporalUnits } from "#src/temporal";
import { withUnits } from "#src/core";

const SUNDAY = 0;
const WEEK_DAYS = 7;
const SEVEN = 7;

const units = temporalUnits({ weekStartsOn: SUNDAY });
const workdays = {
  workdaysIn: (_units: Units, value: PlainDate): PlainDate => value,
};

describe("withUnits()", () => {
  it("exposes the units it was built with", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(withUnits(units).units).toBe(units);
  });

  it(
    "keeps the kind of a period in the bound operations' types",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const time = withUnits(units);
      const day = time.period(date("2026-03-15"), "day");
      const hour = time.period(zoned("2026-03-15T10:00[UTC]"), "hour");
      expectTypeOf(day).toEqualTypeOf<DatePeriod>();
      expectTypeOf(time.next(day)).toEqualTypeOf<DatePeriod>();
      expectTypeOf(time.divide(hour, "minute")).items.toHaveProperty("start");
      expect(time.next(day).start.toString()).toBe("2026-03-16");
    }
  );

  it("binds plugin functions to the same units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const time = withUnits(units, { plugins: [calendar] });
    const grid = time.monthGrid(date("2026-03-15"));
    expectTypeOf(time.monthGrid).returns.toEqualTypeOf<MonthGrid>();
    // The grid follows the units' Sunday week start
    expect(
      grid.periods.map((day) => day.start.dayOfWeek % SEVEN).at(SUNDAY)
    ).toBe(SUNDAY);
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
