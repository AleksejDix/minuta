import type { Period, PlainDate, ZonedDateTime } from "#src/types";
import { compare, isPlainDate, isZoned } from "#src/values";
import type { Temporal } from "@js-temporal/polyfill";
import { sameKind } from "./kinds";

const EQUAL = 0;
const ONE_DAY = 1;

/** What `contains` can look for: a date, a moment, a date and time, or a period. */
type Target =
  | Period
  | PlainDate
  | Readonly<Temporal.PlainDateTime>
  | ZonedDateTime;

/**
 * The target as a period: a date is its day, a moment an empty period at
 * that moment, a date and time its moment in the period's zone or its date.
 *
 * @param period - The containing period
 * @param target - What to look for
 * @returns The target as a period
 */
function asPeriod(period: Period, target: Target): Period {
  if ("start" in target) {
    return target;
  }
  if (isPlainDate(target)) {
    return { end: target.add({ days: ONE_DAY }), start: target, unit: "day" };
  }
  if (isZoned(target)) {
    return { end: target, start: target, unit: "custom" };
  }
  if (isZoned(period.start)) {
    const moment = target.toZonedDateTime(period.start.timeZoneId);
    return { end: moment, start: moment, unit: "custom" };
  }
  return asPeriod(period, target.toPlainDate());
}

/**
 * Whether a period contains a date, a moment or another period. `end` is
 * excluded: March does not contain April 1. A date counts as its whole day;
 * next to a time period, dates become moments in that period's zone.
 *
 * @example
 * contains(march, Temporal.PlainDate.from("2026-03-20")); // true
 * contains(march, Temporal.PlainDate.from("2026-04-01")); // false
 *
 * @param period - The containing period
 * @param target - The date, moment or period to test
 * @returns True when the target lies fully within the period
 */
function contains(period: Period, target: Target): boolean {
  const asTarget = asPeriod(period, target);
  const [outer, inner] = sameKind(period, asTarget);
  const isMoment = compare(inner.start, inner.end) === EQUAL;
  if (isMoment) {
    return (
      compare(outer.start, inner.start) <= EQUAL &&
      compare(inner.start, outer.end) < EQUAL
    );
  }
  return (
    compare(outer.start, inner.start) <= EQUAL &&
    compare(inner.end, outer.end) <= EQUAL
  );
}

export { contains };
export type { Target };
