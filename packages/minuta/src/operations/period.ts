import type {
  DatePeriod,
  DateSpec,
  PeriodOf,
  PlainDate,
  TimePeriod,
  TimeSpec,
  TimeValue,
  Unit,
  Units,
  ZonedDateTime,
} from "#src/types";
import { compare, isPlainDate, toPlainDate, toZoned } from "#src/values";
import { nextStart, specFor, timeZoneOf } from "#src/units";

const ONE = 1;
const AFTER = 0;

/**
 * The period of `unit` that contains `value`. Date units read the value's
 * calendar date; time units its moment, in the units' time zone unless the
 * value carries its own.
 *
 * @example
 * periodWith(units, Temporal.PlainDate.from("2026-03-15"), "month");
 * // { start: 2026-03-01, end: 2026-04-01, unit: "month" }
 * periodWith(units, Temporal.ZonedDateTime.from("2026-03-15T10:30[Europe/Zurich]"), "hour");
 * // { start: 10:00, end: 11:00, unit: "hour" }
 *
 * @param units - Available unit specs
 * @param value - Any value inside the period
 * @param unit - Unit of the period
 * @returns The unit-aligned period, `start` included and `end` excluded
 * @throws {RangeError} `UNIT_NOT_SUPPORTED` for a unit missing from `units`
 */
function periodWith<Name extends Unit>(
  units: Units,
  value: TimeValue,
  unit: Name
): PeriodOf<Name> {
  const spec: DateSpec | TimeSpec = specFor(units, unit);
  const timeZone = timeZoneOf(units);
  if (spec.kind === "date") {
    const start = spec.startOf(toPlainDate(value));
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A date spec belongs to a date unit, whose period is a DatePeriod
    return { end: spec.add(start, ONE), start, unit } as PeriodOf<Name>;
  }
  const start = spec.startOf(toZoned(value, timeZone));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A time spec belongs to a time unit, whose period is a TimePeriod
  return { end: nextStart(spec, start), start, unit } as PeriodOf<Name>;
}

/**
 * The period from `start` (included) to `end` (excluded), unit `"custom"`. Equal
 * values make an empty period; an end before the start is an error, as
 * nothing is swapped behind your back.
 *
 * @example
 * period(Temporal.PlainDate.from("2026-01-01"), Temporal.PlainDate.from("2026-04-01"));
 * // { start: 2026-01-01, end: 2026-04-01, unit: "custom" }: January to March
 *
 * @param start - The first moment or date, included
 * @param end - The end, excluded, of the same kind
 * @returns The custom period
 * @throws {RangeError} When `end` comes before `start`
 * @throws {TypeError} When one is a date and the other a moment
 */
function period(start: PlainDate, end: PlainDate): DatePeriod;
function period(start: ZonedDateTime, end: ZonedDateTime): TimePeriod;
function period(
  start: PlainDate | ZonedDateTime,
  end: PlainDate | ZonedDateTime
): DatePeriod | TimePeriod {
  if (compare(start, end) > AFTER) {
    throw new RangeError(
      `period() needs the start first: ${start.toString()} is after ${end.toString()}.`
    );
  }
  if (isPlainDate(start) && isPlainDate(end)) {
    return { end, start, unit: "custom" };
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- compare() has thrown unless both are moments
  return { end, start, unit: "custom" } as TimePeriod;
}

export { period, periodWith };
