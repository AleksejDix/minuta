/**
 * Allowed dates of a field: limits and unavailable days, reported rather
 * than enforced, so typing and the arrow keys never fight the user.
 */

import type { Segment } from "./types";
import { toDate } from "./convert";

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
 * The dates a field allows. `min` and `max` are inclusive; in a field
 * without a time they allow their whole day, so `min: new Date()` means
 * "from today".
 */
type DateRules = Readonly<{
  isUnavailable?: (date: Readonly<Date>) => boolean;
  max?: Readonly<Date>;
  min?: Readonly<Date>;
}>;

const TIME_TYPES: ReadonlySet<string> = new Set(["hour", "minute", "second"]);
const YEAR_KEY = 10_000;
const MONTH_KEY = 100;
const MONTH_INDEX_OFFSET = 1;
const SAME = 0;

// A number that orders local days: 2026-06-15 → 20260615
function dayKey(date: Readonly<Date>): number {
  return (
    date.getFullYear() * YEAR_KEY +
    (date.getMonth() + MONTH_INDEX_OFFSET) * MONTH_KEY +
    date.getDate()
  );
}

function hasTime(segments: readonly Segment[]): boolean {
  return segments.some((segment) => TIME_TYPES.has(segment.type));
}

/**
 * Where `date` falls against a limit: negative before it, 0 on it, positive
 * after it. Fields without a time compare whole days.
 *
 * @param date - The field's date
 * @param limit - `min` or `max`
 * @param byDay - Whether to compare days instead of moments
 * @returns The order of the two
 */
function compared(
  date: Readonly<Date>,
  limit: Readonly<Date>,
  byDay: boolean
): number {
  if (byDay) {
    return dayKey(date) - dayKey(limit);
  }
  return date.getTime() - limit.getTime();
}

/**
 * Whether `date` is before `min` or after `max`.
 *
 * @param date - The field's date
 * @param rules - The allowed dates
 * @param byDay - Whether to compare days instead of moments
 * @returns The problem, or undefined inside the limits
 */
function limitProblem(
  date: Readonly<Date>,
  rules: DateRules,
  byDay: boolean
): DateProblemCode | undefined {
  if (rules.min !== undefined && compared(date, rules.min, byDay) < SAME) {
    return DateProblem.BeforeMin;
  }
  if (rules.max !== undefined && compared(date, rules.max, byDay) > SAME) {
    return DateProblem.AfterMax;
  }
  return undefined;
}

/**
 * Why the field's date is not allowed, if it is not. The limits are checked
 * first, then `isUnavailable`. An unfinished or impossible date reports
 * nothing: there is no date to check yet.
 *
 * @example
 * checkDate(parseSegments(format, "31.12.2025"), { min: new Date(2026, 0, 1) });
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
  const date = toDate(segments);
  if (date === undefined) {
    return undefined;
  }
  const limit = limitProblem(date, rules, !hasTime(segments));
  if (limit !== undefined) {
    return limit;
  }
  if (rules.isUnavailable !== undefined && rules.isUnavailable(date)) {
    return DateProblem.Unavailable;
  }
  return undefined;
}

export { DateProblem, checkDate };
export type { DateProblemCode, DateRules };
