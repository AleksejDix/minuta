import { date, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { createUnits } from "#src/create-units";

const units = createUnits({ timeZone: "Europe/Zurich" });

const MINUS_TWO = -2;
const MINUS_ONE = -1;
const ZERO = 0;
const ONE = 1;
const TWO = 2;
const THREE = 3;
const FIVE = 5;
const SIX = 6;
const TWENTY_THREE = 23;
const THIRTY_ONE = 31;

describe("date specs: startOf", () => {
  it.each([
    { start: "2026-01-01", unit: "year", value: "2026-08-15" },
    { start: "2026-07-01", unit: "quarter", value: "2026-08-15" },
    { start: "2026-01-01", unit: "quarter", value: "2026-03-31" },
    { start: "2026-08-01", unit: "month", value: "2026-08-15" },
    { start: "2026-03-16", unit: "week", value: "2026-03-18" },
    { start: "2026-03-16", unit: "week", value: "2026-03-16" },
    { start: "2026-03-16", unit: "week", value: "2026-03-22" },
    { start: "2026-03-18", unit: "day", value: "2026-03-18" },
  ] as const)(
    "$unit of $value starts on $start",
    { timeout: 5000 },
    ({ start, unit, value }) => {
      expect.hasAssertions();
      expect(units[unit].startOf(date(value)).toString()).toBe(start);
    }
  );

  it.each([
    { start: "2026-03-15", weekStartsOn: "sunday" },
    { start: "2026-03-14", weekStartsOn: "saturday" },
    { start: "2026-03-18", weekStartsOn: "wednesday" },
  ] as const)(
    "a week from $weekStartsOn starts on $start",
    { timeout: 5000 },
    ({ start, weekStartsOn }) => {
      expect.hasAssertions();
      const { week } = createUnits({ weekStartsOn });
      expect(week.startOf(date("2026-03-18")).toString()).toBe(start);
    }
  );
});

describe("date specs: add", () => {
  it.each([
    { amount: ONE, result: "2026-02-28", unit: "month", value: "2026-01-31" },
    {
      amount: MINUS_ONE,
      result: "2026-02-28",
      unit: "month",
      value: "2026-03-31",
    },
    { amount: ONE, result: "2027-02-28", unit: "quarter", value: "2026-11-30" },
    { amount: ONE, result: "2025-02-28", unit: "year", value: "2024-02-29" },
    {
      amount: MINUS_TWO,
      result: "2026-03-04",
      unit: "week",
      value: "2026-03-18",
    },
    { amount: ONE, result: "2027-01-01", unit: "day", value: "2026-12-31" },
  ] as const)(
    "$unit: $value plus $amount is $result",
    { timeout: 5000 },
    ({ amount, result, unit, value }) => {
      expect.hasAssertions();
      expect(units[unit].add(date(value), amount).toString()).toBe(result);
    }
  );
});

describe("date specs: diff", () => {
  it.each([
    { count: ONE, from: "2024-02-29", to: "2025-02-28", unit: "year" },
    { count: ZERO, from: "2024-02-29", to: "2025-02-27", unit: "year" },
    { count: ZERO, from: "2025-02-28", to: "2024-02-29", unit: "year" },
    { count: MINUS_ONE, from: "2025-03-01", to: "2024-02-29", unit: "year" },
    { count: ONE, from: "2026-01-31", to: "2026-02-28", unit: "month" },
    { count: ZERO, from: "2026-01-31", to: "2026-02-27", unit: "month" },
    { count: THREE, from: "2026-01-01", to: "2026-12-31", unit: "quarter" },
    { count: ONE, from: "2026-03-18", to: "2026-03-31", unit: "week" },
    { count: MINUS_ONE, from: "2026-03-18", to: "2026-03-05", unit: "week" },
    { count: THIRTY_ONE, from: "2026-03-01", to: "2026-04-01", unit: "day" },
  ] as const)(
    "$unit: from $from to $to are $count complete units",
    { timeout: 5000 },
    ({ count, from, to, unit }) => {
      expect.hasAssertions();
      expect(units[unit].diff(date(from), date(to))).toBe(count);
    }
  );
});

describe("time specs: odd zones and clock changes", () => {
  it(
    "starts hours at full wall-clock hours in a zone offset by 45 minutes",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const start = units.hour.startOf(
        zoned("2026-03-18T10:59[Asia/Kathmandu]")
      );
      expect(start.toString()).toBe(
        "2026-03-18T10:00:00+05:45[Asia/Kathmandu]"
      );
    }
  );

  it(
    "keeps the second of two repeated hours apart from the first",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const first = zoned("2026-11-01T01:00-04:00[America/New_York]");
      const second = units.hour.add(first, ONE);
      expect(second.toString()).toBe(
        "2026-11-01T01:00:00-05:00[America/New_York]"
      );
      expect(units.hour.startOf(second.add({ minutes: 30 })).toString()).toBe(
        second.toString()
      );
      expect(units.hour.diff(first, second)).toBe(ONE);
    }
  );

  it(
    "counts the hours of a spring-forward day as elapsed time",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const start = zoned("2026-03-29T00:00[Europe/Zurich]");
      const end = zoned("2026-03-30T00:00[Europe/Zurich]");
      expect(units.hour.diff(start, end)).toBe(TWENTY_THREE);
    }
  );
});

describe("time specs: minutes and seconds", () => {
  it.each([
    { start: "2026-03-18T10:37:00+01:00[Europe/Zurich]", unit: "minute" },
    { start: "2026-03-18T10:37:42+01:00[Europe/Zurich]", unit: "second" },
  ] as const)(
    "$unit of 10:37:42.5 starts at $start",
    { timeout: 5000 },
    ({ start, unit }) => {
      expect.hasAssertions();
      const value = zoned("2026-03-18T10:37:42.5+01:00[Europe/Zurich]");
      expect(units[unit].startOf(value).toString()).toBe(start);
    }
  );

  it(
    "truncates a partial unit toward zero, both ways",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const from = zoned("2026-03-18T10:00[Europe/Zurich]");
      const to = zoned("2026-03-18T12:59[Europe/Zurich]");
      expect(units.hour.diff(from, to)).toBe(TWO);
      expect(units.hour.diff(to, from)).toBe(MINUS_TWO);
    }
  );
});

describe("createUnits()", () => {
  it("carries its settings", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const custom = createUnits({
      timeZone: "UTC",
      weekStartsOn: "sunday",
      weekend: ["friday", "saturday"],
    });
    expect(custom.timeZone).toBe("UTC");
    expect(custom.weekStartsOn).toBe(ZERO);
    expect(custom.weekend).toStrictEqual([FIVE, SIX]);
  });

  it(
    "defaults to the runtime's zone, Monday weeks and a Saturday-Sunday weekend",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const defaults = createUnits();
      expect(defaults.timeZone).toBe(
        new Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      expect(defaults.weekStartsOn).toBe(ONE);
      expect(defaults.weekend).toStrictEqual([SIX, ZERO]);
    }
  );

  it("marks each spec with its kind", { timeout: 5000 }, () => {
    expect.hasAssertions();
    expect(units.day.kind).toBe("date");
    expect(units.week.kind).toBe("date");
    expect(units.hour.kind).toBe("time");
  });
});
