/**
 * Lookups into a `Units` map. Every unit-aware function goes through these,
 * so a missing unit fails the same way everywhere.
 */

import type { SpecOf, Unit, Units } from "#src/types";
import { runtimeTimeZone } from "#src/values";

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
 * The spec for `unit`.
 *
 * @example
 * specFor(temporalUnits(), "week").startOf(Temporal.PlainDate.from("2026-03-18")); // 2026-03-16, a Monday
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
    const available =
      Object.keys(units)
        .filter((name) => !SETTINGS.has(name))
        .join(", ") || "none";
    throw new RangeError(
      `${MinutaError.UnitNotSupported}: no "${unit}" spec in the units passed (available: ${available}). ` +
        `Pass a full set such as temporalUnits(), or add a "${unit}" spec to your units.`
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

/**
 * Throw an `INVALID_OPTION` `RangeError` unless `value` is a positive whole
 * number.
 *
 * @param value - The option value
 * @param option - Where it came from, e.g. "divideWith() step"
 */
function assertPositiveInteger(value: number, option: string): void {
  if (!Number.isInteger(value) || value < ONE) {
    throw new RangeError(
      `${MinutaError.InvalidOption}: ${option} must be a positive whole number, got ${String(value)}. ` +
        `Pass a count such as 1 or 15.`
    );
  }
}

export { MinutaError, assertPositiveInteger, specFor, timeZoneOf };
export type { MinutaErrorCode };
