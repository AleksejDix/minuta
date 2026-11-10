/**
 * Lookups into a `Units` map. Every unit-aware function goes through these,
 * so a missing unit fails the same way everywhere.
 */

import type {
  DateSpec,
  SpecOf,
  TimeSpec,
  Unit,
  Units,
  ZonedDateTime,
} from "#src/types";
import { compare, runtimeTimeZone } from "#src/values";

const ONE = 1;

/**
 * Codes at the start of the messages of errors minuta throws.
 */
const MinutaError = {
  /** An option such as `step` or `maxPeriods` is not a positive whole number. */
  InvalidOption: "INVALID_OPTION",
  /** `divideWith` would create more chunks than `maxPeriods` allows. */
  TooManyPeriods: "TOO_MANY_PERIODS",
  /** The `units` passed to a function have no spec for the requested unit. */
  UnitNotSupported: "UNIT_NOT_SUPPORTED",
} as const;

/** One of the {@link MinutaError} codes. */
type MinutaErrorCode = (typeof MinutaError)[keyof typeof MinutaError];

// Keys of `Units` that are settings, not unit specs
const SETTINGS: ReadonlySet<string> = new Set([
  "timeZone",
  "weekStartsOn",
  "weekend",
]);

/**
 * The names of the units a set of units has specs for.
 *
 * @param units - Any units
 * @returns The unit names, without the settings
 */
function unitNames(units: Units): string[] {
  return Object.keys(units).filter((name) => !SETTINGS.has(name));
}

/**
 * The spec for `unit`.
 *
 * @example
 * specFor(createUnits(), "week").startOf(Temporal.PlainDate.from("2026-03-18")); // 2026-03-16, a Monday
 *
 * @param units - Available unit specs
 * @param unit - Unit to look up
 * @returns The spec: a `DateSpec` for date units, a `TimeSpec` for time units
 * @throws {RangeError} `UNIT_NOT_SUPPORTED` when `units` has no spec for `unit`
 */
function specFor<Name extends Unit>(units: Units, unit: Name): SpecOf<Name> {
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Units maps each name to SpecOf<name>; indexing by a generic name loses that
  const spec = units[unit] as SpecOf<Name> | undefined;
  if (spec === undefined) {
    const available = unitNames(units).join(", ") || "none";
    throw new RangeError(
      `${MinutaError.UnitNotSupported}: no "${unit}" spec in the units passed (available: ${available}). ` +
        `Pass a full set such as createUnits(), or add a "${unit}" spec to your units.`
    );
  }
  return spec;
}

/**
 * The zone the units turn dates into moments in: their `timeZone`, else the
 * runtime's.
 *
 * @param units - Any units
 * @returns An IANA zone name
 */
function timeZoneOf(units: Units): string {
  return units.timeZone ?? runtimeTimeZone();
}

const EQUAL = 0;

// Whether a moment is the start of its own day in its zone
function isStartOfDay(date: ZonedDateTime): boolean {
  const start = date
    .toPlainDate()
    .toZonedDateTime({ timeZone: date.timeZoneId });
  return compare(start, date) === EQUAL;
}

/**
 * A date spec working on moments, in each moment's own zone. Unit starts are
 * the start of their first day, which is not midnight where the clocks skip
 * it; `add` keeps the wall time, except from the start of a day, where it
 * gives the start of the day it lands on.
 *
 * @param spec - A date unit's spec
 * @returns The same unit on moments
 */
function zonedDateSpec(spec: DateSpec): TimeSpec {
  /**
   * The moment `amount` units later.
   *
   * @param date - Any moment
   * @param amount - How many units
   * @returns The moment
   */
  function add(date: ZonedDateTime, amount: number): ZonedDateTime {
    const timeZone = date.timeZoneId;
    const day = spec.add(date.toPlainDate(), amount);
    if (isStartOfDay(date)) {
      return day.toZonedDateTime({ timeZone });
    }
    return day.toZonedDateTime({ plainTime: date.toPlainTime(), timeZone });
  }
  return {
    add,
    diff: (from, to) => {
      let count = spec.diff(from.toPlainDate(), to.toPlainDate());
      const sign = Math.sign(compare(to, from));
      while (sign * compare(add(from, count), to) > EQUAL) {
        count -= sign;
      }
      while (sign * compare(add(from, count + sign), to) <= EQUAL) {
        count += sign;
      }
      return count;
    },
    kind: "time",
    startOf: (date) =>
      spec
        .startOf(date.toPlainDate())
        .toZonedDateTime({ timeZone: date.timeZoneId }),
  };
}

/**
 * The spec for `unit` working on moments: a time unit's own spec, or a date
 * unit's spec in each moment's zone (see `zonedDateSpec`).
 *
 * @param units - Available unit specs
 * @param unit - Unit to look up
 * @returns A spec on moments
 * @throws {RangeError} `UNIT_NOT_SUPPORTED` when `units` has no spec for `unit`
 */
function timeSpecFor(units: Units, unit: Unit): TimeSpec {
  const spec: DateSpec | TimeSpec = specFor(units, unit);
  if (spec.kind === "time") {
    return spec;
  }
  return zonedDateSpec(spec);
}

/**
 * Where the unit after the one starting at `start` begins: the next
 * boundary, or the zone's next clock change when it comes first and the
 * unit starts there. An hour, a minute or a second never spans a clock
 * change; a day on moments does, its start is the start of its date.
 *
 * @param spec - The unit's spec on moments
 * @param start - A unit start
 * @returns The next unit's start
 */
function nextStart(spec: TimeSpec, start: ZonedDateTime): ZonedDateTime {
  const next = spec.startOf(spec.add(start, ONE));
  // No clock change in between: same offset, no search needed
  if (next.offsetNanoseconds === start.offsetNanoseconds) {
    return next;
  }
  const change = start.getTimeZoneTransition("next");
  if (
    change !== null &&
    compare(change, next) < EQUAL &&
    compare(spec.startOf(change), change) === EQUAL
  ) {
    return change;
  }
  return next;
}

/**
 * Throw an `INVALID_OPTION` `RangeError` unless `value` is a positive whole
 * number.
 *
 * @param value - The option value
 * @param option - Where it came from, e.g. "divide() step"
 */
function assertPositiveInteger(value: number, option: string): void {
  if (!Number.isInteger(value) || value < ONE) {
    throw new RangeError(
      `${MinutaError.InvalidOption}: ${option} must be a positive whole number, got ${String(value)}. ` +
        `Pass a count such as 1 or 15.`
    );
  }
}

export {
  MinutaError,
  assertPositiveInteger,
  nextStart,
  specFor,
  timeSpecFor,
  timeZoneOf,
  unitNames,
};
export type { MinutaErrorCode };
