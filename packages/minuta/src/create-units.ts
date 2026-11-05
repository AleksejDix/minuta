import type { AllUnits, DateSpec } from "#src/types";
import {
  day,
  hour,
  minute,
  month,
  quarter,
  second,
  weekSpec,
  year,
} from "#src/specs";
import { weekStartOf, weekendOf } from "#src/weekday";
import type { WeekOptions } from "#src/weekday";
import { runtimeTimeZone } from "#src/values";

/**
 * Options of `createUnits`: the week, the weekend and the time zone.
 */
type UnitsOptions = WeekOptions &
  Readonly<{
    /**
     * IANA time zone that dates become moments in, e.g. when a day is
     * divided into hours: `"UTC"`, `"Europe/Zurich"`. Default: the runtime's.
     */
    timeZone?: string | undefined;
    /**
     * Temporal calendar every date is read in, e.g. `"hebrew"`,
     * `"islamic-umalqura"`, `"persian"`. Default: each date keeps its own
     * calendar (ISO 8601 for dates made from moments).
     */
    calendar?: string | undefined;
  }>;

/**
 * A date spec that reads every date in `calendar` first.
 *
 * @param spec - A date unit's spec
 * @param calendar - A Temporal calendar id
 * @returns The spec in that calendar
 */
function inCalendar(spec: DateSpec, calendar: string): DateSpec {
  return {
    add: (date, amount) => spec.add(date.withCalendar(calendar), amount),
    diff: (from, to) =>
      spec.diff(from.withCalendar(calendar), to.withCalendar(calendar)),
    kind: "date",
    startOf: (date) => spec.startOf(date.withCalendar(calendar)),
  };
}

/** The date units' specs. */
type DateSpecs = Readonly<
  Record<"day" | "month" | "quarter" | "week" | "year", DateSpec>
>;

/**
 * The date specs in `calendar`, or as they are without one.
 *
 * @param dates - The date units' specs
 * @param calendar - A Temporal calendar id, if any
 * @returns The specs
 */
function datesIn(dates: DateSpecs, calendar: string | undefined): DateSpecs {
  if (calendar === undefined) {
    return dates;
  }
  return {
    day: inCalendar(dates.day, calendar),
    month: inCalendar(dates.month, calendar),
    quarter: inCalendar(dates.quarter, calendar),
    week: inCalendar(dates.week, calendar),
    year: inCalendar(dates.year, calendar),
  };
}

/**
 * Unit specs for every unit, computed with the TC39 Temporal API: date
 * units on `PlainDate`, time units on `ZonedDateTime`. Pass the result to
 * `withUnits`, `calendar`, `intervals` or any `…With` function. Weeks
 * start on Monday unless `weekStartsOn` says otherwise (`"sunday"` …
 * `"saturday"`, or 0 = Sunday … 6 = Saturday); `weekend` sets
 * the days `isWeekend` counts (Saturday and Sunday unless set); `timeZone`
 * is where dates become moments; `calendar` the calendar dates are read in. Where the runtime has no Temporal,
 * `await temporalReady()` first.
 *
 * @example
 * import { createUnits, withUnits } from "@aleksejdix/minuta/core";
 *
 * const time = withUnits(createUnits({ timeZone: "UTC", weekStartsOn: "sunday" }));
 * time.period(Temporal.PlainDate.from("2026-03-18"), "week"); // [Mar 15, Mar 22)
 *
 * @param options - Week start, weekend and time zone
 * @returns A spec for every unit, with the settings
 */
function createUnits(options: UnitsOptions = {}): AllUnits {
  const weekStartsOn = weekStartOf(options);
  const dates = datesIn(
    { day, month, quarter, week: weekSpec(weekStartsOn), year },
    options.calendar
  );
  return {
    day: dates.day,
    hour,
    minute,
    month: dates.month,
    quarter: dates.quarter,
    second,
    timeZone: options.timeZone ?? runtimeTimeZone(),
    week: dates.week,
    weekStartsOn,
    weekend: weekendOf(options),
    year: dates.year,
  };
}

export { createUnits };
export type { UnitsOptions };
