import { date, text } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import type { Period } from "#src/types";
import { monthGridWith } from "./month-grid";
import { temporalUnits } from "#src/adapters/temporal/index";
import { yearGridWith } from "./year-grid";

const monday = temporalUnits({ timeZone: "UTC" });
const sunday = temporalUnits({ timeZone: "UTC", weekStartsOn: "sunday" });

const FIRST = 0;
const LAST = -1;
const ZERO = 0;
const ONE = 1;
const SIX = 6;
const FORTY_TWO = 42;
const FIFTY_THREE = 53;
const FIFTY_FOUR = 54;

// The start of the first period, as text
function firstStart(periods: readonly Period[]): string | undefined {
  return periods.map((period) => period.start.toString()).at(FIRST);
}

function texts(periods: readonly Period[]): string[] {
  return periods.map((period) => text(period));
}

describe("monthGridWith()", () => {
  it(
    "is 42 touching days from the week holding the 1st",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const grid = monthGridWith(monday, date("2026-03-15"));
      const days = texts(grid.periods);
      expect(days).toHaveLength(FORTY_TWO);
      expect(days.at(FIRST)).toBe("2026-02-23/2026-02-24 day");
      expect(days.at(LAST)).toBe("2026-04-05/2026-04-06 day");
      expect(grid.monthStart.toString()).toBe("2026-03-01");
      expect(grid.weekStartsOn).toBe(ONE);
    }
  );

  it.each([
    { first: "2026-03-01", units: sunday, weekStartsOn: ZERO },
    {
      first: "2026-02-28",
      units: temporalUnits({ weekStartsOn: "saturday" }),
      weekStartsOn: SIX,
    },
  ] as const)(
    "starts on the week start $weekStartsOn",
    { timeout: 5000 },
    ({ first, units, weekStartsOn }) => {
      expect.hasAssertions();
      const grid = monthGridWith(units, date("2026-03-15"));
      expect(firstStart(grid.periods)).toBe(first);
      expect(grid.weekStartsOn).toBe(weekStartsOn);
    }
  );

  it("covers leap days and year boundaries", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const february = texts(monthGridWith(monday, date("2024-02-10")).periods);
    expect(february).toContain("2024-02-29/2024-03-01 day");
    const january = monthGridWith(monday, date("2027-01-15"));
    expect(firstStart(january.periods)).toBe("2026-12-28");
  });
});

describe("monthGridWith(): hand-built units", () => {
  it(
    "reports the week spec's start without a weekStartsOn setting",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const handBuilt = {
        day: sunday.day,
        month: sunday.month,
        week: sunday.week,
      };
      const grid = monthGridWith(handBuilt, date("2026-03-15"));
      expect(grid.weekStartsOn).toBe(ZERO);
      expect(grid.periods.map((day) => day.start.dayOfWeek).at(FIRST)).toBe(
        SIX + ONE
      );
    }
  );
});

describe("yearGridWith()", () => {
  it.each([
    { weeks: FIFTY_THREE, year: "2026-06-01" },
    { weeks: FIFTY_THREE, year: "2025-06-01" },
    // A leap year from a Sunday touches 54 Monday weeks
    { weeks: FIFTY_FOUR, year: "2012-06-01" },
  ] as const)(
    "covers $year with $weeks whole weeks",
    { timeout: 5000 },
    ({ weeks, year }) => {
      expect.hasAssertions();
      const grid = yearGridWith(monday, date(year));
      expect(grid.periods).toHaveLength(weeks);
      expect(grid.periods.every((week) => week.unit === "week")).toBe(true);
    }
  );

  it(
    "runs from the week of Jan 1 to the week of Dec 31",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const grid = yearGridWith(monday, date("2025-06-01"));
      const weeks = texts(grid.periods);
      expect(weeks.at(FIRST)).toBe("2024-12-30/2025-01-06 week");
      expect(weeks.at(LAST)).toBe("2025-12-29/2026-01-05 week");
      expect(grid.yearStart.toString()).toBe("2025-01-01");
    }
  );

  it("follows the week start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const grid = yearGridWith(sunday, date("2025-06-01"));
    expect(firstStart(grid.periods)).toBe("2024-12-29");
    expect(grid.weekStartsOn).toBe(ZERO);
  });
});
