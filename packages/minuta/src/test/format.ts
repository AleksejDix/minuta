import { formatPeriod, formatRange } from "#src/segments/format";
import type { ReadonlyPeriod } from "#src/types";

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
function format(period: ReadonlyPeriod, locale: string = TEST_LOCALE): string {
  return formatPeriod(period, locale);
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
function formatAsRange(
  period: ReadonlyPeriod,
  locale: string = TEST_LOCALE
): string {
  return formatRange(period, locale);
}

export { format, formatAsRange };
