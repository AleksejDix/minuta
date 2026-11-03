import type { Period, PlainDate, ZonedDateTime } from "#src/types";
import { compare, isPlainDate } from "#src/values";
import { sameKind } from "./kinds";

const EQUAL = 0;
const ONE_DAY = 1;

/** What `gap` measures between: a period, a date (its day) or a moment. */
type TimePoint = Period | PlainDate | ZonedDateTime;

// A point as a period: a date is its day, a moment an empty period
function spanOf(point: TimePoint): Period {
  if ("start" in point) {
    return point;
  }
  if (isPlainDate(point)) {
    return { end: point.add({ days: ONE_DAY }), start: point, unit: "day" };
  }
  return { end: point, start: point, unit: "custom" };
}

/**
 * The time between two dates, moments or periods: from where the earlier
 * one ends to where the later one starts. A date counts as its whole day, a
 * moment as an instant. Order does not matter.
 *
 * @example
 * gap(period(Temporal.PlainDate.from("2026-03-02"), "day"), period(Temporal.PlainDate.from("2026-03-05"), "day"));
 * // { start: 2026-03-03, end: 2026-03-05, unit: "custom" }: Mar 3 and 4
 * gap(period(Temporal.PlainDate.from("2026-03-02"), "day"), period(Temporal.PlainDate.from("2026-03-03"), "day")); // undefined: they touch
 *
 * @param from - One date, moment or period
 * @param to - The other one
 * @returns The custom period between them, or undefined when they touch or overlap
 */
function gap(from: TimePoint, to: TimePoint): Period | undefined {
  let [first, second] = sameKind(spanOf(from), spanOf(to));
  if (compare(second.start, first.start) < EQUAL) {
    [first, second] = [second, first];
  }
  if (compare(first.end, second.start) >= EQUAL) {
    return undefined;
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- sameKind() made both periods one kind, so the edges are too
  return { end: second.start, start: first.end, unit: "custom" } as Period;
}

export { gap };
export type { TimePoint };
