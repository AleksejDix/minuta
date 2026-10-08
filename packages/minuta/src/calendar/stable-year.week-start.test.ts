import type { Adapter, ReadonlyPeriod } from "#src/types";
import { describe, expect, it } from "vitest";
import { createDateFnsAdapter } from "#src/adapters/date-fns/index";
import { createLuxonAdapter } from "#src/adapters/luxon/index";
import { createNativeAdapter } from "#src/adapters/native/index";
import { createStableYear } from "./stable-year";

const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const FRIDAY = 5;
const SATURDAY = 6;
const DAYS_PER_WEEK = 7;
const MS_PER_DAY = 86_400_000;
const INCLUSIVE_END_DAY = 1;
const SHORT_YEAR_WEEKS = 52;
const LONG_YEAR_WEEKS = 53;
const LAST_INDEX = -1;

const ADAPTERS = [
  ["native", createNativeAdapter()],
  ["date-fns", createDateFnsAdapter()],
  ["luxon", createLuxonAdapter()],
] as const;

function firstPeriod(periods: readonly ReadonlyPeriod[]): ReadonlyPeriod {
  const [first] = periods;
  if (first === undefined) {
    throw new Error("Expected at least one period");
  }
  return first;
}

function lastPeriod(periods: readonly ReadonlyPeriod[]): ReadonlyPeriod {
  const last = periods.at(LAST_INDEX);
  if (last === undefined) {
    throw new Error("Expected at least one period");
  }
  return last;
}

describe.each(ADAPTERS)(
  "createStableYear() weekStartsOn values with %s adapter",
  (_name: string, adapter: Readonly<Adapter>) => {
    it("should handle weekStartsOn = 0 (Sunday)", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const date = new Date("2024-01-01T00:00:00");
      const stableYear = createStableYear(adapter, SUNDAY, date);

      expect(firstPeriod(stableYear.periods).start.getDay()).toBe(SUNDAY);
      expect(lastPeriod(stableYear.periods).end.getDay()).toBe(SATURDAY);
    });

    it("should handle weekStartsOn = 6 (Saturday)", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const date = new Date("2024-01-01T00:00:00");
      const stableYear = createStableYear(adapter, SATURDAY, date);

      expect(firstPeriod(stableYear.periods).start.getDay()).toBe(SATURDAY);
      expect(lastPeriod(stableYear.periods).end.getDay()).toBe(FRIDAY);
    });
  }
);

describe.each(ADAPTERS)(
  "createStableYear() validation with %s adapter",
  (_name: string, adapter: Readonly<Adapter>) => {
    it("should validate correct stableYear periods", { timeout: 5000 }, () => {
      expect.hasAssertions();
      const date = new Date("2024-01-01T00:00:00");
      const stableYear = createStableYear(adapter, MONDAY, date);

      // Period should pass validation
      expect(stableYear.periods).toBeDefined();

      // Manual validation check, adding one day for the inclusive end
      const ms =
        lastPeriod(stableYear.periods).end.getTime() -
        firstPeriod(stableYear.periods).start.getTime();
      const days = Math.round(ms / MS_PER_DAY) + INCLUSIVE_END_DAY;
      const weeks = Math.round(days / DAYS_PER_WEEK);
      expect([SHORT_YEAR_WEEKS, LONG_YEAR_WEEKS]).toContain(weeks);
    });
  }
);

describe.each(ADAPTERS)(
  "createStableYear() helper with %s adapter",
  (_name: string, adapter: Readonly<Adapter>) => {
    it(
      "should create stableYear with createStableYear helper",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const date = new Date("2024-06-15T00:00:00");
        const stableYear = createStableYear(adapter, MONDAY, date);

        expect(stableYear.periods).toBeDefined();
        // Monday (weekStartsOn)
        expect(firstPeriod(stableYear.periods).start.getDay()).toBe(MONDAY);

        const weeks = stableYear.periods;
        expect([SHORT_YEAR_WEEKS, LONG_YEAR_WEEKS]).toContain(weeks.length);
      }
    );

    it(
      "should respect adapter's weekStartsOn in helper",
      { timeout: 5000 },
      () => {
        expect.hasAssertions();
        const date = new Date("2024-01-01T00:00:00");
        const stableYear = createStableYear(adapter, TUESDAY, date);

        expect(firstPeriod(stableYear.periods).start.getDay()).toBe(TUESDAY);
      }
    );
  }
);
