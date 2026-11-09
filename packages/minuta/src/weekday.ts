/**
 * Days of the week by name, so configuration cannot be off by one
 * (`weekStartsOn: "monday"` instead of guessing whether 1 is Monday).
 */

const SUNDAY = 0;
const MONDAY = 1;
const TUESDAY = 2;
const WEDNESDAY = 3;
const THURSDAY = 4;
const FRIDAY = 5;
const SATURDAY = 6;

/** A day of the week by name. */
type Weekday =
  | "friday"
  | "monday"
  | "saturday"
  | "sunday"
  | "thursday"
  | "tuesday"
  | "wednesday";

/** A day of the week as a number: 0 = Sunday … 6 = Saturday. */
type WeekdayNumber =
  | typeof SUNDAY
  | typeof MONDAY
  | typeof TUESDAY
  | typeof WEDNESDAY
  | typeof THURSDAY
  | typeof FRIDAY
  | typeof SATURDAY;

/**
 * Week options of `createUnits`.
 */
type WeekOptions = Readonly<{
  /**
   * Locale whose week to follow: its first day and its weekend, as
   * `Intl.Locale#getWeekInfo` gives them (`"en-US"` starts on Sunday,
   * `"ar-EG"` on Saturday with a Friday–Saturday weekend). `weekStartsOn`
   * and `weekend` win over it. Default: none, the ISO 8601 week.
   */
  locale?: string | undefined;
  /** First day of the week. Default: `"monday"` (ISO 8601), or the locale's. */
  weekStartsOn?: Weekday | WeekdayNumber | undefined;
  /** Days that `isWeekend` counts as weekend. Default: `["saturday", "sunday"]`, or the locale's. */
  weekend?: readonly (Weekday | WeekdayNumber)[] | undefined;
}>;

const NUMBERS: Readonly<Record<Weekday, WeekdayNumber>> = {
  friday: FRIDAY,
  monday: MONDAY,
  saturday: SATURDAY,
  sunday: SUNDAY,
  thursday: THURSDAY,
  tuesday: TUESDAY,
  wednesday: WEDNESDAY,
};

const DEFAULT_WEEK_START: WeekdayNumber = MONDAY;
const DEFAULT_WEEKEND: readonly WeekdayNumber[] = [SATURDAY, SUNDAY];
// Intl counts 1 = Monday … 7 = Sunday; the index is that number modulo 7
const BY_INTL_DAY: readonly WeekdayNumber[] = [
  SUNDAY,
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
];
const MISSING_WEEK_INFO =
  "Intl.Locale#getWeekInfo is missing in this runtime: pass weekStartsOn and weekend instead of locale";

/** A locale's week as `Intl.Locale#getWeekInfo` gives it. */
type WeekInfo = Readonly<{ firstDay: number; weekend: readonly number[] }>;

function hasWeekInfo(
  locale: object
): locale is Readonly<{ getWeekInfo: () => WeekInfo }> {
  return "getWeekInfo" in locale && typeof locale.getWeekInfo === "function";
}

/**
 * A weekday Intl numbers 1 = Monday … 7 = Sunday, as minuta numbers it.
 *
 * @param day - The Intl weekday
 * @returns 0 = Sunday … 6 = Saturday
 */
function fromIntlDay(day: number): WeekdayNumber {
  return BY_INTL_DAY[day % BY_INTL_DAY.length] ?? DEFAULT_WEEK_START;
}

/**
 * The week of a locale.
 *
 * @param tag - A BCP 47 locale, e.g. `"en-US"`
 * @returns Its week info
 * @throws {RangeError} For a tag that is not a locale
 * @throws {Error} Where the runtime has no `Intl.Locale#getWeekInfo`
 */
function weekInfoOf(tag: string): WeekInfo {
  const locale: object = new Intl.Locale(tag);
  if (!hasWeekInfo(locale)) {
    throw new Error(MISSING_WEEK_INFO);
  }
  return locale.getWeekInfo();
}

function weekdayNumber(day: Weekday | WeekdayNumber): WeekdayNumber {
  if (typeof day === "number") {
    return day;
  }
  return NUMBERS[day];
}

/**
 * The first day of the week from the options.
 *
 * @param options - Week options
 * @returns The week start, 0 = Sunday … 6 = Saturday: the option, else the
 *   locale's, else Monday
 */
function weekStartOf(options: WeekOptions): WeekdayNumber {
  if (options.weekStartsOn !== undefined) {
    return weekdayNumber(options.weekStartsOn);
  }
  if (options.locale !== undefined) {
    return fromIntlDay(weekInfoOf(options.locale).firstDay);
  }
  return DEFAULT_WEEK_START;
}

/**
 * The weekend days from the options.
 *
 * @param options - Week options
 * @returns The weekend, 0 = Sunday … 6 = Saturday, Saturday and Sunday by default
 */
function weekendOf(options: WeekOptions): readonly WeekdayNumber[] {
  if (options.weekend !== undefined) {
    return options.weekend.map((day) => weekdayNumber(day));
  }
  if (options.locale !== undefined) {
    return weekInfoOf(options.locale).weekend.map((day) => fromIntlDay(day));
  }
  return DEFAULT_WEEKEND;
}

export { DEFAULT_WEEKEND, weekStartOf, weekendOf };
export type { WeekOptions, Weekday, WeekdayNumber };
