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

/** Display options for minutes, and for custom spans of moments. */
const MINUTE_OPTIONS: DisplayOptions = {
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  month: "short",
};

/**
 * Display options per period type.
 */
const PERIOD_OPTIONS: Readonly<Partial<Record<string, DisplayOptions>>> = {
  custom: CUSTOM_OPTIONS,
  day: { day: "numeric", month: "long", year: "numeric" },
  hour: { day: "numeric", hour: "numeric", minute: "2-digit", month: "short" },
  minute: MINUTE_OPTIONS,
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

// A unit's defaults; a custom span of moments shows its times
function defaultsOf(period: Period): DisplayOptions {
  if (period.unit === "custom" && !isDatePeriod(period)) {
    return MINUTE_OPTIONS;
  }
  return PERIOD_OPTIONS[period.unit] ?? CUSTOM_OPTIONS;
}

function optionsFor(
  period: Period,
  options: DisplayOptions,
  timeZone: string
): Intl.DateTimeFormatOptions {
  const picksFields = FIELDS.some((field) => options[field] !== undefined);
  const defaults = defaultsOf(period);
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

// A range with the shared parts (same year, same month) collapsed
function rangeText(
  period: Period,
  locales: string | readonly string[] | undefined,
  options: DisplayOptions
): string {
  const start = toIntl(period.start);
  const end = toIntl(lastShown(period));
  const format = new Intl.DateTimeFormat(
    locales,
    optionsFor(period, options, start.timeZone)
  );
  return format.formatRange(start.date, end.date);
}

/**
 * A period as locale-aware text, like Temporal's `toLocaleString()`, in the
 * format of its unit: the month and year for a month, a weekday and a day
 * for a day, a range for weeks and custom periods (shared parts collapsed by
 * `Intl.DateTimeFormat#formatRange`; a date period shows its last day, not
 * its exclusive end). For a month as a range, format `range(month.start,
 * month.end)`. The same text everywhere: on native Temporal and the
 * polyfill, on a server and in the browser.
 *
 * @example
 * toLocaleString(march, "de-CH"); // "März 2026"
 * toLocaleString(day, "en-US"); // "March 15, 2026"
 * toLocaleString(day, "en-US", { weekday: "short" }); // "Sun"
 * toLocaleString(week, "ja-JP"); // "2026/03/09～2026/03/15"
 * toLocaleString(range(march.start, march.end), "de-CH"); // "1.–31. März 2026"
 *
 * @param period - Period to format
 * @param locales - BCP 47 locale(s); the runtime's when left out
 * @param options - Intl options. Ones that pick fields (`month`, `weekday`,
 *   `dateStyle` …) replace the unit's defaults; others (`hourCycle`,
 *   `timeZone` for moments) are added to them
 * @returns The formatted period
 */
function toLocaleString(
  period: Period,
  locales?: string | readonly string[],
  options: DisplayOptions = {}
): string {
  if (period.unit === "week" || period.unit === "custom") {
    return rangeText(period, locales, options);
  }
  const start = toIntl(period.start);
  const format = new Intl.DateTimeFormat(
    locales,
    optionsFor(period, options, start.timeZone)
  );
  return format.format(start.date);
}

export { toLocaleString };
