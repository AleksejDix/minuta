import { describe, expect, it } from "vitest";
import { firstOf, lastOf, spanDays, spanOf } from "./grid-test-helpers";
import type { Period } from "#src/types";
import { dateFnsUnits } from "#src/adapters/date-fns/index";
import { divideWith } from "#src/operations/index";
import { luxonUnits } from "#src/adapters/luxon/index";
import { monthGridWith } from "./month-grid";
import { nativeUnits } from "#src/adapters/native/index";

const SUNDAY = 0;
const MONDAY = 1;
const GRID_DAYS = 42;
const GRID_WEEKS = 6;
const SINGLE = 1;
const YEAR_2023 = 2023;
const YEAR_2024 = 2024;

const adapters = [
  { create: nativeUnits, name: "native" },
  { create: dateFnsUnits, name: "date-fns" },
  { create: luxonUnits, name: "luxon" },
] as const;

describe.each(adapters)("monthGridWith() with $name adapter", ({ create }) => {
  it(
    "should create stableMonth period spanning 42 days",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // Jan 15, 2024
      const date = new Date("2024-01-15T00:00:00");
      const stableMonthPeriod = monthGridWith(
        create({ weekStartsOn: MONDAY }),
        date
      );

      expect(stableMonthPeriod.periods).toHaveLength(GRID_DAYS);
      expect(spanDays(stableMonthPeriod.periods)).toBe(GRID_DAYS);
    }
  );

  it("should respect weekStartsOn setting", { timeout: 5000 }, () => {
    expect.hasAssertions();
    // Jan 1, 2024 (Monday)
    const date = new Date("2024-01-01T00:00:00");

    const sundayMonth = monthGridWith(create({ weekStartsOn: SUNDAY }), date);
    expect(firstOf(sundayMonth.periods).start.getDay()).toBe(SUNDAY);

    const mondayMonth = monthGridWith(create({ weekStartsOn: MONDAY }), date);
    expect(firstOf(mondayMonth.periods).start.getDay()).toBe(MONDAY);
  });
});

describe.each(adapters)(
  "monthGridWith() divide with $name adapter",
  ({ create }) => {
    it(
      "should always return exactly 42 days when dividing by day",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Feb 1, 2024
        const date = new Date("2024-02-01T00:00:00");
        const days = monthGridWith(
          create({ weekStartsOn: MONDAY }),
          date
        ).periods;

        expect(days).toHaveLength(GRID_DAYS);
        expect(firstOf(days).unit).toBe("day");
        expect(lastOf(days).unit).toBe("day");
      }
    );

    it(
      "should always return exactly 6 weeks when dividing by week",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Feb 1, 2024
        const date = new Date("2024-02-01T00:00:00");
        const units = create({ weekStartsOn: MONDAY });

        const stableMonth = monthGridWith(units, date);
        const weeks = divideWith(units, spanOf(stableMonth.periods), "week");

        expect(weeks).toHaveLength(GRID_WEEKS);
        for (const week of weeks) {
          expect(week.unit).toBe("week");
        }
      }
    );
  }
);

describe.each(adapters)(
  "monthGridWith() month shapes with $name adapter",
  ({ create }) => {
    it(
      "should handle February correctly (shortest month)",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        // Feb 15, 2024
        const date = new Date("2024-02-15T00:00:00");
        const days = monthGridWith(
          create({ weekStartsOn: MONDAY }),
          date
        ).periods;

        expect(days).toHaveLength(GRID_DAYS);

        // Check that we have days from January and March, spanning multiple months
        const months = new Set(days.map((day: Period) => day.start.getMonth()));
        expect(months.size).toBeGreaterThan(SINGLE);
      }
    );

    it("should handle year boundaries", { timeout: 5000 }, () => {
      expect.hasAssertions();
      // Dec 15, 2023
      const date = new Date("2023-12-15T00:00:00");
      const days = monthGridWith(
        create({ weekStartsOn: MONDAY }),
        date
      ).periods;

      expect(days).toHaveLength(GRID_DAYS);

      // The grid always reaches into the next year
      const years = [
        ...new Set(days.map((day: Period) => day.start.getFullYear())),
      ];
      expect(years).toContain(YEAR_2023);
      expect(years).toContain(YEAR_2024);
    });
  }
);
