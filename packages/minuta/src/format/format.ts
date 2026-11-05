import type { Period, PlainDate, ZonedDateTime } from "#src/types";
import { compare, isDatePeriod, isPlainDate } from "#src/values";

type DisplayOptions = Readonly<Intl.DateTimeFormatOptions>;

const ONE_DAY = 1;
const EQUAL = 0;
const MONTH_OFFSET = 1;
const UTC = "UTC";
const EPOCH = 0;
const ISO_CALENDAR = "iso8601";

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

// The options that pick what to show; any of them replaces the defaults
const FIELDS: readonly (keyof Intl.DateTimeFormatOptions)[] = [
  "dateStyle",
  "day",
  "dayPeriod",
  "era",
  "fractionalSecondDigits",
  "hour",
  "minute",
  "month",
  "second",
  "timeStyle",
  "timeZoneName",
  "weekday",
  "year",
];

/**
 * A value as `Intl` takes it everywhere: a Date and the zone to read it in.
 * The one Date in minuta: native `Intl.DateTimeFormat` cannot format the
 * polyfill's Temporal objects, and `formatRange` takes no Temporal values
 * from a polyfill at all, so formatting goes through the instant as a Date.
 */
type IntlValue = Readonly<{ date: Date; timeZone: string }>;

/**
 * A date or a moment as every `Intl.DateTimeFormat` takes it, native or
 * polyfilled Temporal, in a browser or on a server: a date as its midnight
 * in UTC, read in UTC so no zone shifts it; a moment as its instant, read
 * in its own zone.
 *
 * @param value - A date or a moment
 * @returns The Date and its zone
 */
function toIntl(value: PlainDate | ZonedDateTime): IntlValue {
  if (isPlainDate(value)) {
    // The ISO fields: a Hebrew or Hijri date's own year, month and day are not the Date's
    const iso = value.withCalendar(ISO_CALENDAR);
    const date = new Date(EPOCH);
    date.setUTCFullYear(iso.year, iso.month - MONTH_OFFSET, iso.day);
    return { date, timeZone: UTC };
  }
  return {
    date: new Date(value.epochMilliseconds),
    timeZone: value.timeZoneId,
  };
}

/**
 * The calendar to show a period in: the one it was made in. Options can
 * pick another.
 *
 * @param period - Any period
 * @returns The `calendar` option, none for ISO 8601
 */
function calendarOf(period: Period): Intl.DateTimeFormatOptions {
  const calendar = period.start.calendarId;
  if (calendar === ISO_CALENDAR) {
    return {};
  }
  return { calendar };
}

function optionsFor(
  period: Period,
  options: DisplayOptions,
  timeZone: string
): Intl.DateTimeFormatOptions {
  const picksFields = FIELDS.some((field) => options[field] !== undefined);
  const defaults = PERIOD_OPTIONS[period.unit] ?? CUSTOM_OPTIONS;
  const merged: Intl.DateTimeFormatOptions = {};
  if (!picksFields) {
    Object.assign(merged, defaults);
  }
  Object.assign(merged, calendarOf(period), { timeZone }, options);
  if (isDatePeriod(period)) {
    // A date is the same day in every zone: read it where it was written
    merged.timeZone = UTC;
  }
  return merged;
}

/**
 * The last value a period shows: the day before the end for dates (the end
 * is excluded), the end itself for moments, where 10:00–11:00 reads right.
 *
 * @param period - Any period
 * @returns The value to show as the range's end
 */
function lastShown(period: Period): PlainDate | ZonedDateTime {
  if (isDatePeriod(period) && compare(period.start, period.end) < EQUAL) {
    return period.end.subtract({ days: ONE_DAY });
  }
  return period.end;
}

/**
 * Format a period as a locale-aware range string, collapsing shared parts
 * (same year, same month) with `Intl.DateTimeFormat#formatRange`. A date
 * period shows its first and its last day; a time period its start and its
 * end. The same text everywhere: on native Temporal and the polyfill, on a
 * server and in the browser.
 *
 * @example
 * formatRange(march, "de-CH"); // "1.–31. März 2026"
 * formatRange(lastWeekOfMarch, "de-CH"); // "30. März – 5. Apr. 2026"
 * formatRange(hour, "en-US"); // "Mar 18, 10:00 – 11:00 AM"
 *
 * @param period - Period to format
 * @param locale - BCP 47 locale
 * @param options - Intl options. Ones that pick fields (`month`, `weekday`,
 *   `dateStyle` …) replace the unit's defaults; others (`hourCycle`,
 *   `timeZone` for moments) are added to them
 * @returns The formatted range
 */
function formatRange(
  period: Period,
  locale: string,
  options: DisplayOptions = {}
): string {
  const start = toIntl(period.start);
  const end = toIntl(lastShown(period));
  const format = new Intl.DateTimeFormat(
    locale,
    optionsFor(period, options, start.timeZone)
  );
  return format.formatRange(start.date, end.date);
}

/**
 * Format a period as a locale-aware display string, picking the right
 * format for its unit: a weekday and a day for a day, the month and year
 * for a month, a range for weeks and custom periods. The same text
 * everywhere: on native Temporal and the polyfill, on a server and in the
 * browser.
 *
 * @example
 * formatPeriod(march, "de-CH"); // "März 2026"
 * formatPeriod(day, "en-US"); // "March 15, 2026"
 * formatPeriod(day, "en-US", { weekday: "short" }); // "Sun"
 * formatPeriod(week, "ja-JP"); // "2026/03/09～2026/03/15"
 *
 * @param period - Period to format
 * @param locale - BCP 47 locale
 * @param options - Intl options. Ones that pick fields (`month`, `weekday`,
 *   `dateStyle` …) replace the unit's defaults; others (`hourCycle`,
 *   `timeZone` for moments) are added to them
 * @returns The formatted period
 */
function formatPeriod(
  period: Period,
  locale: string,
  options: DisplayOptions = {}
): string {
  if (period.unit === "week" || period.unit === "custom") {
    return formatRange(period, locale, options);
  }
  const start = toIntl(period.start);
  const format = new Intl.DateTimeFormat(
    locale,
    optionsFor(period, options, start.timeZone)
  );
  return format.format(start.date);
}

export { formatPeriod, formatRange };
