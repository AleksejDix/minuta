/**
 * One function per built-in unit: the year, quarter, month, week, day,
 * hour, minute or second that contains a value, bound to the main entry's
 * units. Units of your own are members of `withUnits`.
 */
import type { DatePeriod, TimePeriod, TimeValue } from "#src/types";
import { periodWith } from "#src/operations/period";
import { units } from "#src/default-units";

/**
 * The year that contains `value`.
 *
 * @example
 * year(Temporal.PlainDate.from("2026-03-15")); // 2026-01-01 up to 2027-01-01
 *
 * @param value - A date or a moment in the year
 * @returns The year, unit `"year"`
 */
function year(value: TimeValue): DatePeriod {
  return periodWith(units, value, "year");
}

/**
 * The quarter that contains `value`.
 *
 * @example
 * quarter(Temporal.PlainDate.from("2026-05-15")); // 2026-04-01 up to 2026-07-01
 *
 * @param value - A date or a moment in the quarter
 * @returns The quarter, unit `"quarter"`
 */
function quarter(value: TimeValue): DatePeriod {
  return periodWith(units, value, "quarter");
}

/**
 * The month that contains `value`.
 *
 * @example
 * month(Temporal.PlainDate.from("2026-03-15")); // 2026-03-01 up to 2026-04-01
 *
 * @param value - A date or a moment in the month
 * @returns The month, unit `"month"`
 */
function month(value: TimeValue): DatePeriod {
  return periodWith(units, value, "month");
}

/**
 * The week that contains `value`, from Monday (ISO 8601). For another week
 * start, use `withUnits(createUnits({ weekStartsOn }))`.
 *
 * @example
 * week(Temporal.PlainDate.from("2026-03-18")); // Monday 2026-03-16 up to 2026-03-23
 *
 * @param value - A date or a moment in the week
 * @returns The week, unit `"week"`
 */
function week(value: TimeValue): DatePeriod {
  return periodWith(units, value, "week");
}

/**
 * The day that contains `value`: its calendar date, a moment's in its own
 * zone.
 *
 * @example
 * day(Temporal.ZonedDateTime.from("2026-03-18T23:30[Asia/Tokyo]")); // 2026-03-18 up to 2026-03-19
 *
 * @param value - A date or a moment in the day
 * @returns The day, unit `"day"`
 */
function day(value: TimeValue): DatePeriod {
  return periodWith(units, value, "day");
}

/**
 * The hour that contains `value`, in the moment's zone; a date is its first
 * hour in the runtime's zone.
 *
 * @example
 * hour(Temporal.ZonedDateTime.from("2026-03-18T10:30[Europe/Zurich]")); // 10:00 up to 11:00
 *
 * @param value - A date or a moment in the hour
 * @returns The hour, unit `"hour"`
 */
function hour(value: TimeValue): TimePeriod {
  return periodWith(units, value, "hour");
}

/**
 * The minute that contains `value`.
 *
 * @example
 * minute(Temporal.ZonedDateTime.from("2026-03-18T10:30:45[Europe/Zurich]")); // 10:30 up to 10:31
 *
 * @param value - A date or a moment in the minute
 * @returns The minute, unit `"minute"`
 */
function minute(value: TimeValue): TimePeriod {
  return periodWith(units, value, "minute");
}

/**
 * The second that contains `value`.
 *
 * @example
 * second(Temporal.ZonedDateTime.from("2026-03-18T10:30:45.5[Europe/Zurich]")); // 10:30:45 up to 10:30:46
 *
 * @param value - A date or a moment in the second
 * @returns The second, unit `"second"`
 */
function second(value: TimeValue): TimePeriod {
  return periodWith(units, value, "second");
}

export { day, hour, minute, month, quarter, second, week, year };
