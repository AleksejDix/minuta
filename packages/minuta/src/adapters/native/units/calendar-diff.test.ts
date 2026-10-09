import { describe, expect, it } from "vitest";
import { nativeUnits } from "#src/adapters/native/index";

const DAYS_IN_2026 = 365;
const WEEKS_IN_2026 = 52;
const ONE = 1;
const START = new Date("2026-01-01T00:00:00");
const FIRST_MONDAY = new Date("2026-01-05T00:00:00");
const { day, week } = nativeUnits({ weekStartsOn: 1 });

function stepsOf(
  first: Readonly<Date>,
  count: number,
  step: (date: Readonly<Date>) => Date
): Readonly<Date>[] {
  const dates: Readonly<Date>[] = [first];
  for (let index = ONE; index <= count; index += ONE) {
    dates.push(step(dates.at(-ONE) ?? first));
  }
  return dates;
}

function pairs(
  dates: readonly Readonly<Date>[]
): (readonly [Readonly<Date>, Readonly<Date>])[] {
  return dates
    .slice(ONE)
    .map((date, index) => [dates[index] ?? date, date] as const);
}

// Every day and week of a year, so DST transitions in the test time zone are covered
const DAY_PAIRS = pairs(
  stepsOf(START, DAYS_IN_2026, (date) => day.add(date, ONE))
);
const WEEK_PAIRS = pairs(
  stepsOf(FIRST_MONDAY, WEEKS_IN_2026, (date) => week.add(date, ONE))
);

describe("native calendar diff", () => {
  it(
    "counts one day between consecutive days, DST included",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const wrong = DAY_PAIRS.filter(
        ([from, to]) => day.diff(from, to) !== ONE
      );
      expect(wrong).toStrictEqual([]);
    }
  );

  it(
    "counts one week between consecutive weeks, DST included",
    { timeout: 5000 },
    () => {
      expect.hasAssertions();
      const wrong = WEEK_PAIRS.filter(
        ([from, to]) => week.diff(from, to) !== ONE
      );
      expect(wrong).toStrictEqual([]);
    }
  );
});
