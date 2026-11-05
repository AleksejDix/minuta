import { date, dateTime, text, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { periodWith, range } from "./period";
import { Temporal } from "temporal-polyfill/full";
import type { TimeValue } from "#src/types";
import { createUnits } from "#src/create-units";

const units = createUnits({ timeZone: "Europe/Zurich" });
const ZURICH = "[Europe/Zurich]";

describe("periodWith(): date units", () => {
  it.each([
    { expected: "2026-01-01/2027-01-01 year", unit: "year" },
    { expected: "2026-01-01/2026-04-01 quarter", unit: "quarter" },
    { expected: "2026-03-01/2026-04-01 month", unit: "month" },
    { expected: "2026-03-16/2026-03-23 week", unit: "week" },
    { expected: "2026-03-18/2026-03-19 day", unit: "day" },
  ] as const)(
    "a $unit is a span of dates, end excluded",
    { timeout: 5000 },
    ({ expected, unit }) => {
      expect.hasAssertions();
      const period = periodWith(units, date("2026-03-18"), unit);
      expect(text(period)).toBe(expected);
    }
  );

  it.each([
    { expected: "2026-12-01/2027-01-01 month", value: "2026-12-31" },
    { expected: "2024-02-01/2024-03-01 month", value: "2024-02-29" },
  ] as const)(
    "the month of $value ends on the next month's first day",
    { timeout: 5000 },
    ({ expected, value }) => {
      expect.hasAssertions();
      const month = periodWith(units, date(value), "month");
      expect(text(month)).toBe(expected);
    }
  );

  it(
    "reads the calendar date of every kind of value",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const values: readonly TimeValue[] = [
        date("2026-03-18"),
        dateTime("2026-03-18T23:30"),
        zoned("2026-03-18T23:30[Asia/Tokyo]"),
        // 23:30 UTC is already Mar 19 in Zurich
        Temporal.Instant.from("2026-03-18T23:30:00Z"),
      ];
      expect(
        values.map((value: TimeValue) =>
          periodWith(units, value, "day").start.toString()
        )
      ).toStrictEqual(["2026-03-18", "2026-03-18", "2026-03-18", "2026-03-19"]);
    }
  );
});

describe("periodWith(): time units", () => {
  it.each([
    {
      expected: `2026-03-18T10:00:00+01:00${ZURICH}/2026-03-18T11:00:00+01:00${ZURICH} hour`,
      unit: "hour",
    },
    {
      expected: `2026-03-18T10:37:00+01:00${ZURICH}/2026-03-18T10:38:00+01:00${ZURICH} minute`,
      unit: "minute",
    },
    {
      expected: `2026-03-18T10:37:42+01:00${ZURICH}/2026-03-18T10:37:43+01:00${ZURICH} second`,
      unit: "second",
    },
  ] as const)(
    "a $unit is a span of moments, end excluded",
    { timeout: 5000 },
    ({ expected, unit }) => {
      expect.hasAssertions();
      const value = zoned(`2026-03-18T10:37:42.5${ZURICH}`);
      expect(text(periodWith(units, value, unit))).toBe(expected);
    }
  );
});

describe("periodWith(): zones and clock changes", () => {
  it(
    "keeps the zone of a moment, and places other values in the units' zone",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const tokyo = periodWith(
        units,
        zoned("2026-03-18T10:30[Asia/Tokyo]"),
        "hour"
      );
      const fromDate = periodWith(units, date("2026-03-18"), "hour");
      expect(tokyo.start.toString()).toBe(
        "2026-03-18T10:00:00+09:00[Asia/Tokyo]"
      );
      expect(fromDate.start.toString()).toBe(
        `2026-03-18T00:00:00+01:00${ZURICH}`
      );
    }
  );

  it(
    "moves a wall time the clocks skip forward, like Temporal does",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const skipped = periodWith(units, dateTime("2026-03-29T02:30"), "hour");
      expect(skipped.start.toString()).toBe(
        `2026-03-29T03:00:00+02:00${ZURICH}`
      );
    }
  );
});

describe("periodWith(): repeated hours", () => {
  it(
    "tells the two repeated hours of a fall-back night apart",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const first = periodWith(
        units,
        zoned(`2026-10-25T02:30+02:00${ZURICH}`),
        "hour"
      );
      const second = periodWith(
        units,
        zoned(`2026-10-25T02:30+01:00${ZURICH}`),
        "hour"
      );
      expect(first.end.toString()).toBe(second.start.toString());
      expect(second.end.toString()).toBe(`2026-10-25T03:00:00+01:00${ZURICH}`);
    }
  );
});

describe("range()", () => {
  it("spans from start to end, end excluded", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const span = range(date("2026-01-01"), date("2026-04-01"));
    expect(text(span)).toBe("2026-01-01/2026-04-01 custom");
  });

  it("swaps values given in reverse order", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const span = range(date("2026-04-01"), date("2025-12-01"));
    expect(text(span)).toBe("2025-12-01/2026-04-01 custom");
  });

  it("makes an empty period from equal values", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const moment = zoned(`2026-03-18T10:00${ZURICH}`);
    const empty = range(moment, moment);
    expect(empty.start.toString()).toBe(empty.end.toString());
  });

  it(
    "orders moments by instant, whatever their zones",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      // 10:00 in Tokyo is 01:00 UTC, an hour after 01:00 in Zurich
      const tokyo = zoned("2026-03-18T10:00[Asia/Tokyo]");
      const zurich = zoned(`2026-03-18T01:00${ZURICH}`);
      expect(range(tokyo, zurich).start).toBe(zurich);
    }
  );
});
