import { date, zoned } from "#src/test/temporal";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { DatePeriod } from "#src/types";
import type { MonthGrid } from "#src/calendar";
import { calendar } from "#src/calendar";
import { createUnits } from "#src/create-units";
import { withUnits } from "#src/core";

const SUNDAY = 0;
const SEVEN = 7;

const units = createUnits({ weekStartsOn: SUNDAY });

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
});

describe("calendar()", () => {
  it("binds the calendar functions to the units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const grids = calendar(units);
    const grid = grids.monthGrid(date("2026-03-15"));
    expectTypeOf(grids.monthGrid).returns.toEqualTypeOf<MonthGrid>();
    // The grid follows the units' Sunday week start
    expect(
      grid.periods.map((day) => day.start.dayOfWeek % SEVEN).at(SUNDAY)
    ).toBe(SUNDAY);
  });
});
