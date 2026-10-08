import type { Period } from "../types";

/**
 * Display options per period type.
 */
const PERIOD_OPTIONS: Record<string, Intl.DateTimeFormatOptions> = {
  day: { day: "numeric", month: "long", year: "numeric" },
  week: { day: "numeric", month: "short", year: "numeric" },
  month: { month: "long", year: "numeric" },
  quarter: { month: "short", year: "numeric" },
  year: { year: "numeric" },
  hour: { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" },
  minute: {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  },
  second: {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  },
  custom: { day: "numeric", month: "short", year: "numeric" },
};

/**
 * Format a period as a locale-aware display string.
 *
 * Uses Intl.DateTimeFormat — zero locale data shipped.
 * Automatically picks the right format based on period type.
 *
 * @example
 * // month period, de-CH
 * formatPeriod(monthPeriod, "de-CH")
 * // → "März 2026"
 *
 * // day period, en-US
 * formatPeriod(dayPeriod, "en-US")
 * // → "March 15, 2026"
 *
 * // week period, ja-JP
 * formatPeriod(weekPeriod, "ja-JP")
 * // → "2026/03/09～2026/03/15"
 */
export function formatPeriod(period: Period, locale: string): string {
  const options = PERIOD_OPTIONS[period.type] ?? PERIOD_OPTIONS.custom;

  if (period.type === "week" || period.type === "custom") {
    return formatRange(period, locale, options);
  }

  const fmt = new Intl.DateTimeFormat(locale, options);
  return fmt.format(period.start);
}

/**
 * Format a period as a locale-aware range string.
 *
 * Uses Intl.DateTimeFormat.formatRange() which intelligently collapses
 * shared parts (same year, same month).
 *
 * @example
 * // Same month: "1.–31. März 2026"
 * // Cross month: "30. März – 5. Apr. 2026"
 * // Cross year: "29. Dez. 2025 – 4. Jan. 2026"
 */
export function formatRange(
  period: Period,
  locale: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const opts = options ?? PERIOD_OPTIONS[period.type] ?? PERIOD_OPTIONS.custom;
  const fmt = new Intl.DateTimeFormat(locale, opts);
  return fmt.formatRange(period.start, period.end);
}

/**
 * Format a period with explicit Intl options.
 *
 * Escape hatch for custom formatting needs.
 *
 * @example
 * formatPeriodWith(period, "de-CH", { weekday: "long", day: "numeric" })
 * // → "Sonntag, 15."
 */
export function formatPeriodWith(
  period: Period,
  locale: string,
  options: Intl.DateTimeFormatOptions
): string {
  const fmt = new Intl.DateTimeFormat(locale, options);
  return fmt.format(period.start);
}
