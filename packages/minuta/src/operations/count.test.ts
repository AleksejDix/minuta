import type { DatePeriod, DateUnit, TimePeriod } from "#src/types";
import { date, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { periodWith, range } from "./period";
import { countWith } from "./count";
import { createUnits } from "#src/create-units";

const units = createUnits({ timeZone: "Europe/Zurich" });

const ZERO = 0;
const ONE = 1;
const TWO = 2;
const FOUR = 4;
const TWELVE = 12;
const TWENTY_THREE = 23;
const TWENTY_FOUR = 24;
const TWENTY_FIVE = 25;
const TWENTY_EIGHT = 28;
const TWENTY_NINE = 29;
const THIRTY_ONE = 31;
const FIFTY_TWO = 52;
const THREE_HUNDRED_SIXTY_FIVE = 365;
const THREE_HUNDRED_SIXTY_SIX = 366;

function periodOf(value: string, unit: DateUnit): DatePeriod {
  return periodWith(units, date(value), unit);
}

function zurich(from: string, to: string): TimePeriod {
  return range(zoned(`${from}[Europe/Zurich]`), zoned(`${to}[Europe/Zurich]`));
}

describe("countWith(): calendar units", () => {
  it.each([
    { count: TWELVE, of: "year", unit: "month" },
    { count: FIFTY_TWO, of: "year", unit: "week" },
    { count: THREE_HUNDRED_SIXTY_FIVE, of: "year", unit: "day" },
    { count: FOUR, of: "year", unit: "quarter" },
    { count: THIRTY_ONE, of: "month", unit: "day" },
    { count: TWENTY_FOUR, of: "day", unit: "hour" },
  ] as const)(
    "a $of has $count complete $unit",
    { timeout: 5000 },
    ({ count, of, unit }) => {
      expect.hasAssertions();
      expect(countWith(units, periodOf("2026-03-18", of), unit)).toBe(count);
    }
  );

  it.each(["year", "quarter", "month", "week", "day"] as const)(
    "counts one %s in every period of it",
    { timeout: 5000 },
    (unit) => {
      expect.hasAssertions();
      expect(countWith(units, periodOf("2026-03-18", unit), unit)).toBe(ONE);
    }
  );

  it.each([
    { days: TWENTY_EIGHT, month: "2026-02-01" },
    { days: TWENTY_NINE, month: "2024-02-01" },
  ] as const)(
    "the month from $month has $days days",
    { timeout: 5000 },
    ({ days, month }) => {
      expect.hasAssertions();
      expect(countWith(units, periodOf(month, "month"), "day")).toBe(days);
    }
  );

  it.each([
    { days: THREE_HUNDRED_SIXTY_FIVE, year: "2100-01-01" },
    { days: THREE_HUNDRED_SIXTY_SIX, year: "2000-01-01" },
  ] as const)(
    "the year from $year has $days days",
    { timeout: 5000 },
    ({ days, year }) => {
      expect.hasAssertions();
      expect(countWith(units, periodOf(year, "year"), "day")).toBe(days);
    }
  );
});

describe("countWith(): partial, empty and zoned periods", () => {
  it("counts only complete units", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const twoMonths = range(date("2026-03-01"), date("2026-04-30"));
    expect(countWith(units, twoMonths, "month")).toBe(ONE);
    expect(
      countWith(units, zurich("2026-03-18T10:00", "2026-03-18T12:59"), "hour")
    ).toBe(TWO);
  });

  it("returns 0 for an empty period", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const empty = range(date("2026-03-18"), date("2026-03-18"));
    expect(countWith(units, empty, "day")).toBe(ZERO);
  });

  it.each([
    { day: "2026-03-29", hours: TWENTY_THREE, zone: "Europe/Zurich" },
    { day: "2026-10-25", hours: TWENTY_FIVE, zone: "Europe/Zurich" },
    { day: "2026-03-01", hours: TWENTY_FOUR, zone: "Asia/Kolkata" },
    { day: "2026-03-01", hours: TWENTY_FOUR, zone: "Asia/Kathmandu" },
  ] as const)(
    "$day in $zone has $hours hours",
    { timeout: 5000 },
    ({ day, hours, zone }) => {
      expect.hasAssertions();
      const inZone = createUnits({ timeZone: zone });
      const period = periodWith(inZone, date(day), "day");
      expect(countWith(inZone, period, "hour")).toBe(hours);
    }
  );

  it(
    "counts the days of a span of moments in its own zone",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const span = range(
        zoned("2026-03-18T10:00[Asia/Tokyo]"),
        zoned("2026-03-20T09:00[Asia/Tokyo]")
      );
      expect(countWith(units, span, "day")).toBe(ONE);
    }
  );
});
