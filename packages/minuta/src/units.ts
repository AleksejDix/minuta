/**
 * Lookups into a `Units` map. Every unit-aware function goes through these,
 * so a missing unit fails the same way everywhere.
 */

import type { Unit, UnitSpec, Units } from "#src/types";

const ONE = 1;

/**
 * Codes at the start of the messages of errors minuta throws.
 */
const MinutaError = {
  /** A Date argument is invalid (`new Date("nope")`). */
  InvalidDate: "INVALID_DATE",
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
 * specFor(nativeUnits(), "week").startOf(new Date(2026, 2, 18)); // Monday Mar 16, 00:00
 *
 * @param units - Available unit specs
 * @param unit - Unit to look up
 * @returns The spec
 * @throws {RangeError} `UNIT_NOT_SUPPORTED` when `units` has no spec for `unit`
 */
function specFor(units: Units, unit: Unit): UnitSpec {
  const spec = units[unit];
  if (spec === undefined) {
    const available =
      Object.keys(units)
        .filter((name) => !SETTINGS.has(name))
        .join(", ") || "none";
    throw new RangeError(
      `${MinutaError.UnitNotSupported}: no "${unit}" spec in the units passed (available: ${available}). ` +
        `Pass a full set such as nativeUnits(), or add a "${unit}" spec to your units.`
    );
  }
  return spec;
}

/**
 * Throw for an invalid Date, like Temporal does: it is a programming error,
 * not a missing result.
 *
 * @param date - Date to check
 * @param name - Name used in the error message
 * @throws {RangeError} `INVALID_DATE` for an invalid Date
 */
function assertValidDate(date: Readonly<Date>, name: string): void {
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(
      `${MinutaError.InvalidDate}: ${name} is an invalid Date. ` +
        `Pass a valid Date such as new Date(2026, 0, 31), and check the string or numbers it was built from.`
    );
  }
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

export { MinutaError, assertPositiveInteger, assertValidDate, specFor };
export type { MinutaErrorCode };
