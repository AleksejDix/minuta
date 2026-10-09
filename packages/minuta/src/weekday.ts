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

/** A day of the week as `Date#getDay()` numbers it: 0 = Sunday … 6 = Saturday. */
type WeekdayNumber =
  | typeof SUNDAY
  | typeof MONDAY
  | typeof TUESDAY
  | typeof WEDNESDAY
  | typeof THURSDAY
  | typeof FRIDAY
  | typeof SATURDAY;

/**
 * Week options every adapter factory accepts.
 */
type WeekOptions = Readonly<{
  /** First day of the week. Default: `"monday"` (ISO 8601). */
  weekStartsOn?: Weekday | WeekdayNumber | undefined;
  /** Days that `isWeekend` counts as weekend. Default: `["saturday", "sunday"]`. */
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

function weekdayNumber(day: Weekday | WeekdayNumber): WeekdayNumber {
  if (typeof day === "number") {
    return day;
  }
  return NUMBERS[day];
}

/**
 * The first day of the week from adapter options.
 *
 * @param options - Adapter options
 * @returns The week start as a `Date#getDay()` number, Monday by default
 */
function weekStartOf(options: WeekOptions): WeekdayNumber {
  return weekdayNumber(options.weekStartsOn ?? DEFAULT_WEEK_START);
}

/**
 * The weekend days from adapter options.
 *
 * @param options - Adapter options
 * @returns The weekend as `Date#getDay()` numbers, Saturday and Sunday by default
 */
function weekendOf(options: WeekOptions): readonly WeekdayNumber[] {
  if (options.weekend === undefined) {
    return DEFAULT_WEEKEND;
  }
  return options.weekend.map((day) => weekdayNumber(day));
}

export { DEFAULT_WEEK_START, DEFAULT_WEEKEND, weekStartOf, weekendOf };
export type { WeekOptions, Weekday, WeekdayNumber };
