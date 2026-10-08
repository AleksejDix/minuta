import { describe, expect, it } from "vitest";
import { firstOf, lastOf, spanDays, spanOf } from "./grid-test-helpers";
import type { ReadonlyPeriod } from "#src/types";
import { createDateFnsAdapter } from "#src/adapters/date-fns/index";
import { createLuxonAdapter } from "#src/adapters/luxon/index";
import { createNativeAdapter } from "#src/adapters/native/index";
import { createStableMonth } from "./stable-month";
import { divide } from "#src/index";

const SUNDAY = 0;
const MONDAY = 1;
const GRID_DAYS = 42;
const GRID_WEEKS = 6;
const SINGLE = 1;
const YEAR_2023 = 2023;
const YEAR_2024 = 2024;

const adapters = [
  { create: createNativeAdapter, name: "native" },
  { create: createDateFnsAdapter, name: "date-fns" },
  { create: createLuxonAdapter, name: "luxon" },
] as const;

describe.each(adapters)(
  "createStableMonth() with $name adapter",
  ({ create }) => {
    it(
      "should create stableMonth period spanning 42 days",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Jan 15, 2024
        const date = new Date("2024-01-15T00:00:00");
        const stableMonthPeriod = createStableMonth(create(), MONDAY, date);

        expect(stableMonthPeriod.periods).toHaveLength(GRID_DAYS);
        expect(spanDays(stableMonthPeriod.periods)).toBe(GRID_DAYS);
      }
    );

    it("should respect weekStartsOn setting", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Jan 1, 2024 (Monday)
      const date = new Date("2024-01-01T00:00:00");
      const adapter = create();

      const sundayMonth = createStableMonth(adapter, SUNDAY, date);
      expect(firstOf(sundayMonth.periods).start.getDay()).toBe(SUNDAY);

      const mondayMonth = createStableMonth(adapter, MONDAY, date);
      expect(firstOf(mondayMonth.periods).start.getDay()).toBe(MONDAY);
    });
  }
);

describe.each(adapters)(
  "createStableMonth() divide with $name adapter",
  ({ create }) => {
    it(
      "should always return exactly 42 days when dividing by day",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Feb 1, 2024
        const date = new Date("2024-02-01T00:00:00");
        const days = createStableMonth(create(), MONDAY, date).periods;

        expect(days).toHaveLength(GRID_DAYS);
        expect(firstOf(days).type).toBe("day");
        expect(lastOf(days).type).toBe("day");
      }
    );

    it(
      "should always return exactly 6 weeks when dividing by week",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Feb 1, 2024
        const date = new Date("2024-02-01T00:00:00");
        const adapter = create();

        const stableMonth = createStableMonth(adapter, MONDAY, date);
        const weeks = divide(adapter, spanOf(stableMonth.periods), "week");

        expect(weeks).toHaveLength(GRID_WEEKS);
        for (const week of weeks) {
          expect(week.type).toBe("week");
        }
      }
    );
  }
);

describe.each(adapters)(
  "createStableMonth() month shapes with $name adapter",
  ({ create }) => {
    it(
      "should handle February correctly (shortest month)",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Feb 15, 2024
        const date = new Date("2024-02-15T00:00:00");
        const days = createStableMonth(create(), MONDAY, date).periods;

        expect(days).toHaveLength(GRID_DAYS);

        // Check that we have days from January and March, spanning multiple months
        const months = new Set(
          days.map((day: ReadonlyPeriod) => day.start.getMonth())
        );
        expect(months.size).toBeGreaterThan(SINGLE);
      }
    );

    it("should handle year boundaries", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Dec 15, 2023
      const date = new Date("2023-12-15T00:00:00");
      const days = createStableMonth(create(), MONDAY, date).periods;

      expect(days).toHaveLength(GRID_DAYS);

      // The grid always reaches into the next year
      const years = [
        ...new Set(days.map((day: ReadonlyPeriod) => day.start.getFullYear())),
      ];
      expect(years).toContain(YEAR_2023);
      expect(years).toContain(YEAR_2024);
    });
  }
);
