import type { DatePeriod, DateUnit, TimePeriod } from "#src/types";
import { date, text, zoned } from "#src/test/temporal";
import { describe, expect, it } from "vitest";
import { nextWith, previousWith, shiftWith } from "./shift";
import { periodWith, range } from "./period";
import { temporalUnits } from "#src/adapters/temporal/index";

const units = temporalUnits({ timeZone: "Europe/Zurich" });
const ZURICH = "[Europe/Zurich]";

const MINUS_THREE_HUNDRED_SIXTY_SIX = -366;
const MINUS_THREE = -3;
const MINUS_ONE = -1;
const ZERO = 0;
const ONE = 1;
const TWO = 2;
const FIVE = 5;
const TWELVE = 12;
const FORTY_EIGHT = 48;
const THREE_HUNDRED_SIXTY_SIX = 366;

function periodOf(value: string, unit: DateUnit): DatePeriod {
  return periodWith(units, date(value), unit);
}

function zurich(from: string, to: string): TimePeriod {
  return range(zoned(`${from}${ZURICH}`), zoned(`${to}${ZURICH}`));
}

describe("nextWith() and previousWith(): date units", () => {
  it.each([
    {
      next: "2027-01-01/2028-01-01 year",
      previous: "2025-01-01/2026-01-01 year",
      unit: "year",
    },
    {
      next: "2026-04-01/2026-07-01 quarter",
      previous: "2025-10-01/2026-01-01 quarter",
      unit: "quarter",
    },
    {
      next: "2026-04-01/2026-05-01 month",
      previous: "2026-02-01/2026-03-01 month",
      unit: "month",
    },
    {
      next: "2026-03-23/2026-03-30 week",
      previous: "2026-03-09/2026-03-16 week",
      unit: "week",
    },
    {
      next: "2026-03-19/2026-03-20 day",
      previous: "2026-03-17/2026-03-18 day",
      unit: "day",
    },
  ] as const)(
    "the $unit after and before",
    { timeout: 5000 },
    ({ next, previous, unit }) => {
      expect.hasAssertions();
      const period = periodOf("2026-03-18", unit);
      expect(text(nextWith(units, period))).toBe(next);
      expect(text(previousWith(units, period))).toBe(previous);
    }
  );
});

describe("nextWith(): across months and years", () => {
  it.each([
    { from: "2026-12-31", next: "2027-01-01/2027-01-02 day", unit: "day" },
    { from: "2026-12-15", next: "2027-01-01/2027-02-01 month", unit: "month" },
    { from: "2024-01-31", next: "2024-02-01/2024-03-01 month", unit: "month" },
  ] as const)(
    "crosses into the next year and month from $from",
    { timeout: 5000 },
    ({ from, next, unit }) => {
      expect.hasAssertions();
      const period = periodOf(from, unit);
      expect(text(nextWith(units, period))).toBe(next);
    }
  );
});

describe("nextWith(): a walk", () => {
  it(
    "walks through a month day after day without gaps",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      let day = periodOf("2026-03-01", "day");
      for (let step = ONE; step < TWELVE; step += ONE) {
        const next = nextWith(units, day);
        expect(next.start.toString()).toBe(day.end.toString());
        day = next;
      }
    }
  );
});

describe("nextWith() and previousWith(): time units", () => {
  it.each([
    {
      from: `2026-03-18T23:30${ZURICH}`,
      next: `2026-03-19T00:00:00+01:00${ZURICH}`,
      unit: "hour",
    },
    {
      from: `2026-03-18T10:59:30${ZURICH}`,
      next: `2026-03-18T11:00:00+01:00${ZURICH}`,
      unit: "minute",
    },
    {
      from: `2026-03-18T10:59:59.5${ZURICH}`,
      next: `2026-03-18T11:00:00+01:00${ZURICH}`,
      unit: "second",
    },
  ] as const)(
    "the $unit after $from starts at $next",
    { timeout: 5000 },
    ({ from, next, unit }) => {
      expect.hasAssertions();
      const period = periodWith(units, zoned(from), unit);
      const after = nextWith(units, period);
      expect(after.start.toString()).toBe(next);
      expect(previousWith(units, after)).toStrictEqual(period);
    }
  );
});

describe("shiftWith()", () => {
  it.each([
    { expected: "2026-05-01/2026-06-01 month", steps: TWO },
    { expected: "2025-12-01/2026-01-01 month", steps: MINUS_THREE },
    { expected: "2027-03-01/2027-04-01 month", steps: TWELVE },
  ] as const)(
    "moves March by $steps months",
    { timeout: 5000 },
    ({ expected, steps }) => {
      expect.hasAssertions();
      const march = periodOf("2026-03-18", "month");
      expect(text(shiftWith(units, march, steps))).toBe(expected);
    }
  );

  it("returns the same period for 0 steps", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const march = periodOf("2026-03-18", "month");
    expect(shiftWith(units, march, ZERO)).toBe(march);
  });

  it(
    "is the same as stepping with next that many times",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      let week = periodOf("2026-12-20", "week");
      const shifted = shiftWith(units, week, FIVE);
      for (let step = ZERO; step < FIVE; step += ONE) {
        week = nextWith(units, week);
      }
      expect(shifted).toStrictEqual(week);
    }
  );
});

describe("shiftWith(): long and leap-year moves", () => {
  it.each([
    {
      expected: "2025-01-01/2025-01-02 day",
      from: "2024-01-01",
      steps: THREE_HUNDRED_SIXTY_SIX,
    },
    {
      expected: "2024-01-01/2024-01-02 day",
      from: "2025-01-01",
      steps: MINUS_THREE_HUNDRED_SIXTY_SIX,
    },
  ] as const)(
    "moves the day $from by $steps",
    { timeout: 5000 },
    ({ expected, from, steps }) => {
      expect.hasAssertions();
      const day = periodOf(from, "day");
      expect(text(shiftWith(units, day, steps))).toBe(expected);
    }
  );

  it("moves February of a leap year by four years", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const february = periodOf("2024-02-29", "month");
    expect(text(shiftWith(units, february, FORTY_EIGHT))).toBe(
      "2028-02-01/2028-03-01 month"
    );
  });
});

describe("shiftWith(): custom periods", () => {
  it(
    "moves a span of dates by its own number of days",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const span = range(date("2026-03-10"), date("2026-03-13"));
      expect(text(shiftWith(units, span, ONE))).toBe(
        "2026-03-13/2026-03-16 custom"
      );
      expect(text(shiftWith(units, span, MINUS_ONE))).toBe(
        "2026-03-07/2026-03-10 custom"
      );
    }
  );

  it(
    "moves a span of moments by its exact length, across a clock change",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const span = zurich("2026-03-28T12:00", "2026-03-29T12:00");
      // Noon to noon across the spring-forward night is 23 hours, so it ends at 11:00
      expect(shiftWith(units, span, ONE).end.toString()).toBe(
        `2026-03-30T11:00:00+02:00${ZURICH}`
      );
    }
  );
});
