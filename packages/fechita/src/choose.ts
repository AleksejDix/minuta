/**
 * Choosing the date: the readings that name a real day, resolved by the
 * order or locale when the text alone allows several.
 */

import type { DateParts, Locales, Order, ParseOptions } from "./types";
import { dateOf, partsOf, problemOf } from "./date";
import type { Clock } from "./date";
import { ParseError } from "./errors";
import type { ParseErrorCode } from "./errors";
import type { Reading } from "./candidates";
import { localeFor } from "./words";

const ONE = 1;
const NONE = 0;

/**
 * What `parseDate` returns: the date, or why there is not exactly one.
 */
type ParseResult =
  | Readonly<{
      /** The date: local time, or the exact instant when the text has an offset */
      date: Date;
      /** The fields read from the text */
      parts: DateParts;
      valid: true;
    }>
  | Readonly<{
      /** Every date the text could mean, e.g. both readings of 04/05/2026 */
      candidates: readonly Date[];
      /** Why there is not exactly one date */
      errorCodes: readonly ParseErrorCode[];
      valid: false;
    }>;

/**
 * A result without a date.
 *
 * @param codes - Why there is none
 * @param candidates - The dates the text could mean
 * @returns The failed result
 */
function failure(
  codes: readonly ParseErrorCode[],
  candidates: readonly Readonly<Date>[] = []
): ParseResult {
  return { candidates, errorCodes: codes, valid: false };
}

/**
 * The result of one reading at a time of day.
 *
 * @param reading - Day, month and year
 * @param clock - Time of day and offset
 * @returns The valid result
 */
function success(reading: Reading, clock: Clock): ParseResult {
  const parts = partsOf(reading, clock);
  return { date: dateOf(parts), parts, valid: true };
}

function orderFor(locales: Locales, options: ParseOptions): Order | undefined {
  if (options.order !== undefined || options.locale === undefined) {
    return options.order;
  }
  const data = localeFor(locales, options.locale);
  if (data === undefined) {
    return undefined;
  }
  return data.regionOrders[options.locale] ?? data.order;
}

// Why no reading names a real day: each distinct problem once
function problems(readings: readonly Reading[]): ParseErrorCode[] {
  const codes = readings.flatMap((reading) =>
    [problemOf(reading)].filter((code) => code !== undefined)
  );
  if (codes.length === NONE) {
    return [ParseError.NoDate];
  }
  return [...new Set(codes)];
}

// Several real readings: the one in `order`, or AMBIGUOUS_DAY_MONTH
function pickedIn(
  real: readonly Reading[],
  clock: Clock,
  order: Order | undefined
): ParseResult {
  const picked = real.find((reading) => reading.order === order);
  if (picked === undefined) {
    return failure(
      [ParseError.AmbiguousDayMonth],
      real.map((reading) => dateOf(partsOf(reading, clock)))
    );
  }
  return success(picked, clock);
}

/**
 * The date of the readings: the only real one, or the one in the order of
 * `options`; otherwise the reasons and candidates.
 *
 * @param readings - Every reading of the text
 * @param clock - Time of day and offset
 * @param scope - The loaded locales and the options
 * @returns The result
 */
function chosen(
  readings: readonly Reading[],
  clock: Clock,
  scope: Readonly<{ locales: Locales; options: ParseOptions }>
): ParseResult {
  const real = readings.filter((reading) => problemOf(reading) === undefined);
  const [only] = real;
  if (only === undefined) {
    return failure(problems(readings));
  }
  if (real.length === ONE) {
    return success(only, clock);
  }
  return pickedIn(real, clock, orderFor(scope.locales, scope.options));
}

export { chosen, failure, success };
export type { ParseResult };
