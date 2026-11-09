import type { Period } from "#src/types";
import { isDatePeriod } from "#src/values";
import { range } from "#src/operations/period";
import { toLocaleString } from "#src/format/format";

/**
 * Default test locale — en-US for readable English assertions.
 */
const TEST_LOCALE = "en-US";

/**
 * Format a period for test assertions.
 *
 * ```ts
 * expect(format(result)).toBe("April 2024");
 * ```
 * @param period - The period to format
 * @param locale - The locale to format with
 * @returns The formatted period
 */
function format(period: Period, locale: string = TEST_LOCALE): string {
  return toLocaleString(period, locale);
}

/**
 * Format a period as a range for test assertions.
 *
 * ```ts
 * expect(formatAsRange(week)).toBe("Mar 9 – 15, 2026");
 * ```
 * @param period - The period to format
 * @param locale - The locale to format with
 * @returns The formatted range
 */
function formatAsRange(period: Period, locale: string = TEST_LOCALE): string {
  if (isDatePeriod(period)) {
    return toLocaleString(range(period.start, period.end), locale);
  }
  return toLocaleString(range(period.start, period.end), locale);
}

export { format, formatAsRange };
