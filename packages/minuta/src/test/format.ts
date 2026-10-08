import type { Period } from "../types";
import { formatPeriod, formatRange } from "../segments/format";

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
 */
export function format(period: Period, locale: string = TEST_LOCALE): string {
  return formatPeriod(period, locale);
}

/**
 * Format a period as a range for test assertions.
 *
 * ```ts
 * expect(formatAsRange(week)).toBe("Mar 9 – 15, 2026");
 * ```
 */
export function formatAsRange(
  period: Period,
  locale: string = TEST_LOCALE
): string {
  return formatRange(period, locale);
}
