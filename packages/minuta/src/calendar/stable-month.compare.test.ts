import { contains, derivePeriod as period } from "#src/index";
import { describe, expect, it } from "vitest";
import { firstOf, lastOf, spanDays, spanOf } from "./grid-test-helpers";
import type { ReadonlyPeriod } from "#src/types";
import { createDateFnsAdapter } from "#src/adapters/date-fns/index";
import { createLuxonAdapter } from "#src/adapters/luxon/index";
import { createNativeAdapter } from "#src/adapters/native/index";
import { createStableMonth } from "./stable-month";

const MONDAY = 1;
const FEBRUARY = 1;
const GRID_DAYS = 42;
const DAYS_PER_WEEK = 7;
const LEAP_FEBRUARY_DAYS = 29;

const adapters = [
  { create: createNativeAdapter, name: "native" },
  { create: createDateFnsAdapter, name: "date-fns" },
  { create: createLuxonAdapter, name: "luxon" },
] as const;

const weekStarts = Array.from(
  { length: DAYS_PER_WEEK },
  (_value: unknown, index: number) => index
);

describe.each(adapters)(
  "createStableMonth() navigation with $name adapter",
  ({ create }) => {
    it(
      "should create stableMonth for different months",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const adapter = create();

        // Create stableMonth for different months manually
        const january = createStableMonth(
          adapter,
          MONDAY,
          new Date("2024-01-15T00:00:00")
        );
        const february = createStableMonth(
          adapter,
          MONDAY,
          new Date("2024-02-15T00:00:00")
        );

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
  "createStableMonth() comparison with $name adapter",
  ({ create }) => {
    it(
      "should check if date is contained in stableMonth",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Jan 15, 2024
        const date = new Date("2024-01-15T00:00:00");
        const adapter = create();
        const grid = spanOf(createStableMonth(adapter, MONDAY, date).periods);

        // Date in the middle of the month
        const midMonthPeriod = period(
          adapter,
          new Date("2024-01-20T00:00:00"),
          "day"
        );
        expect(contains(grid, midMonthPeriod)).toBe(true);

        // Date from previous month that's included in the grid
        const earlyPeriod = period(adapter, new Date(grid.start), "day");
        expect(contains(grid, earlyPeriod)).toBe(true);
      }
    );
  }
);

describe.each(adapters)(
  "createStableMonth() boundaries with $name adapter",
  ({ create }) => {
    it(
      "should check if two stableMonths have the same boundaries",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Jan 15, 2024
        const date = new Date("2024-01-15T00:00:00");
        const adapter = create();

        const month1 = createStableMonth(adapter, MONDAY, date).periods;
        const month2 = createStableMonth(adapter, MONDAY, date).periods;

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
        const adapter = create();
        const month1 = createStableMonth(
          adapter,
          MONDAY,
          new Date("2024-01-15T00:00:00")
        ).periods;
        const february = createStableMonth(
          adapter,
          MONDAY,
          new Date("2024-02-15T00:00:00")
        ).periods;
        expect(firstOf(month1).start.getTime()).not.toBe(
          firstOf(february).start.getTime()
        );
      }
    );
  }
);

describe("createStableMonth() edge cases", () => {
  it("should handle leap years correctly", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Feb 15, 2024 (leap year)
    const date = new Date("2024-02-15T00:00:00");
    const days = createStableMonth(createNativeAdapter(), MONDAY, date).periods;

    expect(days).toHaveLength(GRID_DAYS);

    // February 2024 has 29 days
    const febDays = days.filter(
      (day: ReadonlyPeriod) => day.start.getMonth() === FEBRUARY
    );
    expect(febDays.length).toBeLessThanOrEqual(LEAP_FEBRUARY_DAYS);
  });

  it.each(weekStarts)(
    "should handle weekStartsOn %i",
    { timeout: 5000 },
    (weekStartsOn: number) => {
      expect.hasAssertions();
      // Jan 1, 2024
      const date = new Date("2024-01-01T00:00:00");
      const stableMonth = createStableMonth(
        createNativeAdapter(),
        weekStartsOn,
        date
      );
      expect(firstOf(stableMonth.periods).start.getDay()).toBe(weekStartsOn);

      // Always 42 days
      expect(spanDays(stableMonth.periods)).toBe(GRID_DAYS);
    }
  );
});
