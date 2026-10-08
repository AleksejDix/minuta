import type { Temporal } from "@js-temporal/polyfill";

type TemporalApi = typeof Temporal;

const MONTH_INDEX_OFFSET = 1;

/**
 * Check whether a scope object exposes a Temporal implementation.
 * @param scope - The object to inspect (usually `globalThis`)
 * @returns True when `scope.Temporal` is defined
 */
function hasTemporal(
  scope: Readonly<object>
): scope is { Temporal: TemporalApi } {
  return "Temporal" in scope && scope.Temporal !== undefined;
}

/**
 * Read the Temporal implementation registered on `globalThis`.
 * @returns The global Temporal namespace
 */
function getTemporal(): TemporalApi {
  const scope: object = globalThis;
  if (!hasTemporal(scope)) {
    throw new Error("Temporal API is not available in this environment.");
  }
  return scope.Temporal;
}

/**
 * Convert a local Date to a Temporal PlainDate (local calendar date).
 * @param date - The local Date
 * @returns The matching PlainDate
 */
function toPlainDate(date: Readonly<Date>): Temporal.PlainDate {
  return getTemporal().PlainDate.from({
    day: date.getDate(),
    month: date.getMonth() + MONTH_INDEX_OFFSET,
    year: date.getFullYear(),
  });
}

/**
 * Convert a local Date to a Temporal PlainDateTime (local wall-clock time).
 * @param date - The local Date
 * @returns The matching PlainDateTime
 */
function toPlainDateTime(date: Readonly<Date>): Temporal.PlainDateTime {
  return getTemporal().PlainDateTime.from({
    day: date.getDate(),
    hour: date.getHours(),
    millisecond: date.getMilliseconds(),
    minute: date.getMinutes(),
    month: date.getMonth() + MONTH_INDEX_OFFSET,
    second: date.getSeconds(),
    year: date.getFullYear(),
  });
}

export { getTemporal, hasTemporal, toPlainDate, toPlainDateTime };
