import type { ReadonlyPeriod } from "#src/types";

type DisplayOptions = Readonly<Intl.DateTimeFormatOptions>;

/**
 * Display options for custom ranges and unknown period types.
 */
const CUSTOM_OPTIONS: DisplayOptions = {
  day: "numeric",
  month: "short",
  year: "numeric",
};

/**
 * Display options per period type.
 */
const PERIOD_OPTIONS: Readonly<Partial<Record<string, DisplayOptions>>> = {
  custom: CUSTOM_OPTIONS,
  day: { day: "numeric", month: "long", year: "numeric" },
  hour: { day: "numeric", hour: "numeric", minute: "2-digit", month: "short" },
  minute: {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
  },
  month: { month: "long", year: "numeric" },
  quarter: { month: "short", year: "numeric" },
  second: {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    second: "2-digit",
  },
  week: { day: "numeric", month: "short", year: "numeric" },
  year: { year: "numeric" },
};

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
 * @param period - Period to format
 * @param locale - BCP 47 locale
 * @param options - Intl options (defaults to the options for the period type)
 * @returns The formatted range
 */
function formatRange(
  period: ReadonlyPeriod,
  locale: string,
  options?: DisplayOptions
): string {
  const opts = options ?? PERIOD_OPTIONS[period.type] ?? CUSTOM_OPTIONS;
  const fmt = new Intl.DateTimeFormat(locale, opts);
  return fmt.formatRange(period.start, period.end);
}

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
 * @param period - Period to format
 * @param locale - BCP 47 locale
 * @returns The formatted period
 */
function formatPeriod(period: ReadonlyPeriod, locale: string): string {
  const options = PERIOD_OPTIONS[period.type] ?? CUSTOM_OPTIONS;

  if (period.type === "week" || period.type === "custom") {
    return formatRange(period, locale, options);
  }

  const fmt = new Intl.DateTimeFormat(locale, options);
  return fmt.format(period.start);
}

/**
 * Format a period with explicit Intl options.
 *
 * Escape hatch for custom formatting needs.
 *
 * @example
 * formatPeriodWith(period, "de-CH", { weekday: "long", day: "numeric" })
 * // → "Sonntag, 15."
 * @param period - Period to format
 * @param locale - BCP 47 locale
 * @param options - Intl options
 * @returns The formatted period start
 */
function formatPeriodWith(
  period: ReadonlyPeriod,
  locale: string,
  options: DisplayOptions
): string {
  const fmt = new Intl.DateTimeFormat(locale, options);
  return fmt.format(period.start);
}

export { formatPeriod, formatPeriodWith, formatRange };
