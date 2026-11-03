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
    const start = spec.startOf(toPlainDate(value, timeZone));
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A date spec belongs to a date unit, whose period is a DatePeriod
    return { end: spec.add(start, ONE), start, unit } as PeriodOf<Name>;
  }
  const start = spec.startOf(toZoned(value, timeZone));
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A time spec belongs to a time unit, whose period is a TimePeriod
  return { end: nextStart(spec, start), start, unit } as PeriodOf<Name>;
}

/**
 * A custom period from `start` (included) to `end` (excluded). Forgiving:
 * values given in reverse order are swapped. Equal values make an empty
 * period.
 *
 * @example
 * range(Temporal.PlainDate.from("2026-01-01"), Temporal.PlainDate.from("2026-04-01"));
 * // { start: 2026-01-01, end: 2026-04-01, unit: "custom" }: January to March
 *
 * @param start - One edge of the range
 * @param end - The other edge, of the same kind
 * @returns The custom period
 */
function range(start: PlainDate, end: PlainDate): DatePeriod;
function range(start: ZonedDateTime, end: ZonedDateTime): TimePeriod;
function range(
  start: PlainDate | ZonedDateTime,
  end: PlainDate | ZonedDateTime
): DatePeriod | TimePeriod {
  let [first, last] = [start, end];
  if (compare(first, last) > AFTER) {
    [first, last] = [last, first];
  }
  if (isPlainDate(first) && isPlainDate(last)) {
    return { end: last, start: first, unit: "custom" };
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- compare() has thrown unless both are moments
  return { end: last, start: first, unit: "custom" } as TimePeriod;
}

export { periodWith, range };
