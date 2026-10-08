/**
 * Lookups into a `Units` map. Every unit-aware function goes through these,
 * so a missing unit fails the same way everywhere.
 */

import type { Unit, UnitSpec, Units } from "#src/types";

/**
 * Codes at the start of the messages of errors minuta throws.
 */
const MinutaError = {
  /** A Date argument is invalid (`new Date("nope")`). */
  InvalidDate: "INVALID_DATE",
  /** The `units` passed to a function have no spec for the requested unit. */
  UnitNotSupported: "UNIT_NOT_SUPPORTED",
} as const;

/** One of the {@link MinutaError} codes. */
type MinutaErrorCode = (typeof MinutaError)[keyof typeof MinutaError];

/**
 * The spec for `unit`.
 *
 * @param units - Available unit specs
 * @param unit - Unit to look up
 * @returns The spec
 * @throws {RangeError} `UNIT_NOT_SUPPORTED` when `units` has no spec for `unit`
 */
function specFor(units: Units, unit: Unit): UnitSpec {
  const spec = units[unit];
  if (spec === undefined) {
    throw new RangeError(`${MinutaError.UnitNotSupported}: ${unit}`);
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
    throw new RangeError(`${MinutaError.InvalidDate}: ${name}`);
  }
}

export { MinutaError, assertValidDate, specFor };
export type { MinutaErrorCode };
