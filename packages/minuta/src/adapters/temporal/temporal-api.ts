import type { Temporal } from "@js-temporal/polyfill";
import { Temporal as polyfill } from "@js-temporal/polyfill";

type TemporalApi = typeof Temporal;

const MONTH_INDEX_OFFSET = 1;

/**
 * Check whether a scope object exposes a Temporal implementation.
 * @param scope - The object to inspect (usually `globalThis`)
 * @returns True when `scope.Temporal` is defined
 */
function hasTemporal(scope: object): scope is { Temporal: TemporalApi } {
  return "Temporal" in scope && scope.Temporal !== undefined;
}

/**
 * Read the runtime's Temporal, falling back to `@js-temporal/polyfill`
 * without touching `globalThis`.
 * @returns The Temporal namespace
 */
function getTemporal(): TemporalApi {
  const scope: object = globalThis;
  if (hasTemporal(scope)) {
    return scope.Temporal;
  }
  return polyfill;
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

export { getTemporal, toPlainDate };
