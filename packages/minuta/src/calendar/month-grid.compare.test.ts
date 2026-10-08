import { contains, periodWith } from "#src/operations/index";
import { describe, expect, it } from "vitest";
import { firstOf, lastOf, spanDays, spanOf } from "./grid-test-helpers";
import type { Period } from "#src/types";
import type { WeekStartsOn } from "#src/adapters/native/units/week";
import { dateFnsUnits } from "#src/adapters/date-fns/index";
import { luxonUnits } from "#src/adapters/luxon/index";
import { monthGridWith } from "./month-grid";
import { nativeUnits } from "#src/adapters/native/index";

const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;
const FEBRUARY = 1;
const GRID_DAYS = 42;
const LEAP_FEBRUARY_DAYS = 29;

const adapters = [
  { create: nativeUnits, name: "native" },
  { create: dateFnsUnits, name: "date-fns" },
  { create: luxonUnits, name: "luxon" },
] as const;

const weekStarts: readonly WeekStartsOn[] = [
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
];

describe.each(adapters)(
  "monthGridWith() navigation with $name adapter",
  ({ create }) => {
    it(
      "should create stableMonth for different months",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const units = create({ weekStartsOn: MONDAY });

        // Create stableMonth for different months manually
        const january = monthGridWith(units, new Date("2024-01-15T00:00:00"));
        const february = monthGridWith(units, new Date("2024-02-15T00:00:00"));

        expect(january.periods).toHaveLength(GRID_DAYS);
        expect(february.periods).toHaveLength(GRID_DAYS);

        // Both should be 42 days
        expect(spanDays(january.periods)).toBe(GRID_DAYS);
        expect(spanDays(february.periods)).toBe(GRID_DAYS);
      }
    );
  }
);

describe.each(adapters)(
  "monthGridWith() comparison with $name adapter",
  ({ create }) => {
    it(
      "should check if date is contained in stableMonth",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Jan 15, 2024
        const date = new Date("2024-01-15T00:00:00");
        const units = create({ weekStartsOn: MONDAY });
        const grid = spanOf(monthGridWith(units, date).periods);

        // Date in the middle of the month
        const midMonthPeriod = periodWith(
          units,
          new Date("2024-01-20T00:00:00"),
          "day"
        );
        expect(contains(grid, midMonthPeriod)).toBe(true);

        // Date from previous month that's included in the grid
        const earlyPeriod = periodWith(units, new Date(grid.start), "day");
        expect(contains(grid, earlyPeriod)).toBe(true);
      }
    );
  }
);

describe.each(adapters)(
  "monthGridWith() boundaries with $name adapter",
  ({ create }) => {
    it(
      "should check if two stableMonths have the same boundaries",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Jan 15, 2024
        const date = new Date("2024-01-15T00:00:00");
        const units = create({ weekStartsOn: MONDAY });

        const month1 = monthGridWith(units, date).periods;
        const month2 = monthGridWith(units, date).periods;

        // Same date should produce same boundaries
        expect(firstOf(month1).start.getTime()).toBe(
          firstOf(month2).start.getTime()
        );
        expect(lastOf(month1).end.getTime()).toBe(lastOf(month2).end.getTime());
      }
    );

    it(
      "should give a different month different boundaries",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const units = create({ weekStartsOn: MONDAY });
        const month1 = monthGridWith(
          units,
          new Date("2024-01-15T00:00:00")
        ).periods;
        const february = monthGridWith(
          units,
          new Date("2024-02-15T00:00:00")
        ).periods;
        expect(firstOf(month1).start.getTime()).not.toBe(
          firstOf(february).start.getTime()
        );
      }
    );
  }
);

describe("monthGridWith() edge cases", () => {
  it("should handle leap years correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Feb 15, 2024 (leap year)
    const date = new Date("2024-02-15T00:00:00");
    const days = monthGridWith(
      nativeUnits({ weekStartsOn: MONDAY }),
      date
    ).periods;

    expect(days).toHaveLength(GRID_DAYS);

    // February 2024 has 29 days
    const febDays = days.filter(
      (day: Period) => day.start.getMonth() === FEBRUARY
    );
    expect(febDays.length).toBeLessThanOrEqual(LEAP_FEBRUARY_DAYS);
  });

  it.each(weekStarts)(
    "should handle weekStartsOn %i",
    { timeout: 5000 },
    (weekStartsOn: WeekStartsOn) => {
      expect.hasAssertions();
      // Jan 1, 2024
      const date = new Date("2024-01-01T00:00:00");
      const stableMonth = monthGridWith(nativeUnits({ weekStartsOn }), date);
      expect(firstOf(stableMonth.periods).start.getDay()).toBe(weekStartsOn);

      // Always 42 days
      expect(spanDays(stableMonth.periods)).toBe(GRID_DAYS);
    }
  );
});
