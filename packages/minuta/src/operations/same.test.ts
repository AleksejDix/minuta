import type { DatePeriod, TimePeriod } from "#src/types";
import { date, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { periodWith, range } from "./period";
import { createUnits } from "#src/create-units";
import { sameWith } from "./same";

const units = createUnits({ timeZone: "Europe/Zurich" });

function dayPeriod(value: string): DatePeriod {
  return periodWith(units, date(value), "day");
}

function hourAt(iso: string): TimePeriod {
  return periodWith(units, zoned(`${iso}[Europe/Zurich]`), "hour");
}

function span(from: string, to: string): DatePeriod {
  return range(date(from), date(to));
}

describe("sameWith(): calendar units", () => {
  it.each([
    { first: "2026-03-16", same: true, second: "2026-03-22", unit: "week" },
    { first: "2026-03-22", same: false, second: "2026-03-23", unit: "week" },
    { first: "2026-03-01", same: true, second: "2026-03-31", unit: "month" },
    { first: "2026-03-31", same: false, second: "2026-04-01", unit: "month" },
    { first: "2026-01-15", same: true, second: "2026-03-31", unit: "quarter" },
    { first: "2026-12-31", same: false, second: "2027-01-01", unit: "year" },
    { first: "2026-03-18", same: true, second: "2026-03-18", unit: "day" },
  ] as const)(
    "$first and $second in the same $unit: $same",
    { timeout: 5000 },
    ({ first, same, second, unit }) => {
      expect.hasAssertions();
      expect(sameWith(units, dayPeriod(first), dayPeriod(second), unit)).toBe(
        same
      );
    }
  );

  it("compares a month and a week by their starts", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const month = periodWith(units, date("2026-02-01"), "month");
    const week = periodWith(units, date("2026-03-18"), "week");
    expect(sameWith(units, month, week, "quarter")).toBe(true);
  });
});

describe("sameWith(): time units and custom", () => {
  it(
    "puts hours of one day in the same day, and hours of two days apart",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const evening = hourAt("2026-03-18T23:00");
      expect(sameWith(units, hourAt("2026-03-18T08:00"), evening, "day")).toBe(
        true
      );
      expect(sameWith(units, evening, hourAt("2026-03-19T00:00"), "day")).toBe(
        false
      );
    }
  );

  it("asks for identical edges with custom", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const tenDays = span("2026-03-01", "2026-03-10");
    const later = span("2026-03-01", "2026-03-11");
    const shifted = span("2026-03-02", "2026-03-10");
    expect(
      sameWith(units, tenDays, span("2026-03-01", "2026-03-10"), "custom")
    ).toBe(true);
    expect(sameWith(units, tenDays, later, "custom")).toBe(false);
    expect(sameWith(units, tenDays, shifted, "custom")).toBe(false);
  });
});
