/**
 * Allowed dates of a field: limits and unavailable days, reported rather
 * than enforced, so typing and the arrow keys never fight the user.
 */

import type { Segment } from "./types";
import type { Temporal } from "./temporal-api";
import { temporal } from "./temporal-api";
import { toPlainDateTime } from "./temporal";

/** Why a finished date is not allowed, as named constants. */
const DateProblem = {
  /** The date is after `max` */
  AfterMax: "AFTER_MAX",
  /** The date is before `min` */
  BeforeMin: "BEFORE_MIN",
  /** `isUnavailable` returned true for the date */
  Unavailable: "UNAVAILABLE",
} as const;

type DateProblemCode = (typeof DateProblem)[keyof typeof DateProblem];

/**
 * The dates a field allows. `min` and `max` are inclusive: a `PlainDate`
 * allows its whole day, also in a field with a time, so
 * `min: Temporal.Now.plainDateISO()` means "from today"; a `PlainDateTime`
 * is an exact limit in a field with a time. `isUnavailable` gets the day.
 */
type DateRules = Readonly<{
  isUnavailable?: (day: Readonly<Temporal.PlainDate>) => boolean;
  max?: Limit;
  min?: Limit;
}>;

/** A limit of a field: a whole day, or a moment on a wall clock. */
type Limit = Readonly<Temporal.PlainDate> | Readonly<Temporal.PlainDateTime>;

const SAME = 0;
const TIME_TYPES: ReadonlySet<string> = new Set(["hour", "minute", "second"]);

function hasTime(segments: readonly Segment[]): boolean {
  return segments.some((segment) => TIME_TYPES.has(segment.type));
}

function isDay(limit: Limit): limit is Readonly<Temporal.PlainDate> {
  return !("hour" in limit);
}

/**
 * Where `value` falls against a limit: negative before it, 0 on it,
 * positive after it. A day limit, or a field without a time, compares
 * whole days.
 *
 * @param value - The field's date and time, midnight without a time
 * @param limit - `min` or `max`
 * @param byDay - Whether the field shows no time
 * @returns The order of the two
 */
function compared(
  value: Readonly<Temporal.PlainDateTime>,
  limit: Limit,
  byDay: boolean
): number {
  const api = temporal();
  if (byDay || isDay(limit)) {
    return api.PlainDate.compare(value.toPlainDate(), limit);
  }
  return api.PlainDateTime.compare(value, limit);
}

/**
 * Why `value` is not allowed, if it is not. The limits are checked first,
 * then `isUnavailable`.
 *
 * @param value - The date and time to check, midnight without a time
 * @param rules - The allowed dates
 * @param byDay - Whether to compare whole days
 * @returns The problem, or undefined when the date is allowed
 */
function problemOf(
  value: Readonly<Temporal.PlainDateTime>,
  rules: DateRules,
  byDay: boolean
): DateProblemCode | undefined {
  if (rules.min !== undefined && compared(value, rules.min, byDay) < SAME) {
    return DateProblem.BeforeMin;
  }
  if (rules.max !== undefined && compared(value, rules.max, byDay) > SAME) {
    return DateProblem.AfterMax;
  }
  if (
    rules.isUnavailable !== undefined &&
    rules.isUnavailable(value.toPlainDate())
  ) {
    return DateProblem.Unavailable;
  }
  return undefined;
}

/**
 * Why the field's date is not allowed, if it is not. The limits are checked
 * first, then `isUnavailable`. An unfinished or impossible date reports
 * nothing: there is no date to check yet.
 *
 * @example
 * checkDate(parseSegments(format, "31.12.2025"), {
 *   min: Temporal.PlainDate.from("2026-01-01"),
 * });
 * // → "BEFORE_MIN"
 *
 * @param segments - The field's segments
 * @param rules - The allowed dates
 * @returns The problem, or undefined when the date is allowed or unfinished
 */
function checkDate(
  segments: readonly Segment[],
  rules: DateRules
): DateProblemCode | undefined {
  const value = toPlainDateTime(segments);
  if (value === undefined) {
    return undefined;
  }
  return problemOf(value, rules, !hasTime(segments));
}

/**
 * Why `day` is not allowed, if it is not: the same rules as
 * {@link checkDate}, comparing whole days. Give it to a calendar so it
 * disables exactly the days the field reports.
 *
 * @example
 * <CalendarRoot isDisabled={(day) => checkDay(day.start, rules) !== undefined} />
 *
 * @param day - The day
 * @param rules - The allowed dates
 * @returns The problem, or undefined when the day is allowed
 */
function checkDay(
  day: Readonly<Temporal.PlainDate>,
  rules: DateRules
): DateProblemCode | undefined {
  return problemOf(day.toPlainDateTime(), rules, true);
}

export { DateProblem, checkDate, checkDay };
export type { DateProblemCode, DateRules };
