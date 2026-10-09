import type { AllUnits, WeekOptions } from "#src/core";
import { describe, expect, it } from "vitest";
import { isWeekdayWith, isWeekendWith, periodWith, range } from "#src/core";
import { dateFnsTzUnits } from "#src/date-fns-tz";
import { dateFnsUnits } from "#src/date-fns";
import { dayjsUnits } from "#src/dayjs";
import { luxonUnits } from "#src/luxon";
import { momentUnits } from "#src/moment";
import { nativeUnits } from "#src/native";
import { temporalUnits } from "#src/temporal";

// The process time zone, so date-fns-tz's local days match the others
const TIME_ZONE = new Intl.DateTimeFormat().resolvedOptions().timeZone;

const SUNDAY = 0;
const FRIDAY = 5;
const SATURDAY = 6;

const FACTORIES: readonly (readonly [
  string,
  (options: WeekOptions) => AllUnits,
])[] = [
  ["Native", nativeUnits],
  ["date-fns", dateFnsUnits],
  [
    "date-fns-tz",
    (options) =>
      dateFnsTzUnits({
        timeZone: TIME_ZONE,
        weekStartsOn: options.weekStartsOn,
        weekend: options.weekend,
      }),
  ],
  ["Day.js", dayjsUnits],
  ["Luxon", luxonUnits],
  ["Moment.js", momentUnits],
  ["Temporal", temporalUnits],
];

const WEDNESDAY_NOON = new Date("2026-03-18T12:00");
const THURSDAY = new Date("2026-03-19T12:00");
const FRIDAY_NOON = new Date("2026-03-20T12:00");
const SATURDAY_NOON = new Date("2026-03-21T12:00");
const SUNDAY_NOON = new Date("2026-03-22T12:00");

describe.each(FACTORIES)("week options of %s", (_name, createUnits) => {
  it("accepts day names for the week start", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const named = createUnits({ weekStartsOn: "sunday" });
    const numbered = createUnits({ weekStartsOn: SUNDAY });
    const week = periodWith(named, WEDNESDAY_NOON, "week");
    expect(week.start.getDay()).toBe(SUNDAY);
    expect(week).toStrictEqual(periodWith(numbered, WEDNESDAY_NOON, "week"));
  });

  it("defaults to a Saturday and Sunday weekend", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = createUnits({});
    expect(units.weekend).toStrictEqual([SATURDAY, SUNDAY]);
    expect(isWeekendWith(units, periodWith(units, SUNDAY_NOON, "day"))).toBe(
      true
    );
    expect(isWeekendWith(units, periodWith(units, FRIDAY_NOON, "day"))).toBe(
      false
    );
  });

  it("follows a Friday and Saturday weekend", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const units = createUnits({ weekend: ["friday", "saturday"] });
    expect(units.weekend).toStrictEqual([FRIDAY, SATURDAY]);
    expect(isWeekendWith(units, periodWith(units, FRIDAY_NOON, "day"))).toBe(
      true
    );
    expect(isWeekendWith(units, periodWith(units, SUNDAY_NOON, "day"))).toBe(
      false
    );
    expect(isWeekdayWith(units, periodWith(units, SUNDAY_NOON, "day"))).toBe(
      true
    );
    expect(isWeekdayWith(units, periodWith(units, THURSDAY, "day"))).toBe(true);
  });
});

describe("isWeekendWith() over several days", () => {
  const units = nativeUnits({ weekend: ["friday", "saturday"] });

  it("is true when every day touched is weekend", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const both = range(
      periodWith(units, FRIDAY_NOON, "day").start,
      periodWith(units, SATURDAY_NOON, "day").end
    );
    expect(isWeekendWith(units, both)).toBe(true);
    expect(isWeekdayWith(units, both)).toBe(false);
  });

  it("is false for both when a period mixes days", { timeout: 5000 }, () => {
    expect.hasAssertions();
    const week = periodWith(units, WEDNESDAY_NOON, "week");
    expect(isWeekendWith(units, week)).toBe(false);
    expect(isWeekdayWith(units, week)).toBe(false);
  });
});
