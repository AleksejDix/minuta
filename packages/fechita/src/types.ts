/**
 * Order of day, month and year in numeric dates: `DMY` (31.03.2026),
 * `MDY` (3/31/2026) or `YMD` (2026/03/31).
 */
type Order = "DMY" | "MDY" | "YMD";

/**
 * The date words and numeric order of one locale, generated from Unicode
 * CLDR. Plain, frozen data: pass it to `withLocales`.
 */
type LocaleData = Readonly<{
  /**
   * AM and PM words, e.g. `["AM", "vorm."]`, and flexible day periods with
   * the hours they cover, e.g. "晚上" from 19 before 24
   */
  dayPeriods: Readonly<{
    am: readonly string[];
    flexible: readonly Readonly<{
      before: number;
      from: number;
      names: readonly string[];
    }>[];
    pm: readonly string[];
  }>;
  /** Era names: before and after the common era */
  eras: Readonly<{ ad: readonly string[]; bc: readonly string[] }>;
  /** Names of each month (index 0 is January), wide and abbreviated */
  months: readonly (readonly string[])[];
  /** Order of numeric dates in this locale */
  order: Order;
  /** Regional locales whose order differs, e.g. `{ "en-GB": "DMY" }` */
  regionOrders: Readonly<Record<string, Order>>;
  /** BCP 47 tag, e.g. `"de"` or `"zh-Hant"` */
  tag: string;
  /** Names of each weekday (index 0 is Sunday) */
  weekdays: readonly (readonly string[])[];
}>;

/**
 * Locale data by tag, as passed to `withLocales`.
 */
type Locales = Readonly<Record<string, LocaleData>>;

/**
 * Options of `parseDate`.
 */
type ParseOptions = Readonly<{
  /**
   * Locale of the text: its order resolves ambiguous dates and its words win
   * when two locales use one word differently. Default: none, so `04/05/2026`
   * is reported as ambiguous.
   */
  locale?: string | undefined;
  /** Order for ambiguous numeric dates; takes precedence over `locale` */
  order?: Order | undefined;
  /** Reference for two-digit years (80 years back, 19 ahead). Default: now */
  referenceDate?: Readonly<Date> | undefined;
}>;

/**
 * The calendar fields that were read. `offsetMinutes` is set when the text
 * carries a UTC offset or `Z`.
 */
type DateParts = Readonly<{
  day: number;
  hour: number;
  millisecond: number;
  minute: number;
  /** Month 1–12 */
  month: number;
  offsetMinutes?: number | undefined;
  second: number;
  year: number;
}>;

export type { DateParts, LocaleData, Locales, Order, ParseOptions };
