import type { Period } from "#src/types";

const ONE_MS = 1;

type TimePoint = Period | Readonly<Date>;

type Span = Readonly<{ end: number; start: number }>;

function spanOf(point: TimePoint): Span {
  if ("start" in point) {
    return { end: point.end.getTime(), start: point.start.getTime() };
  }
  return { end: point.getTime(), start: point.getTime() };
}

function inOrder(left: Span, right: Span): readonly [Span, Span] {
  if (right.start < left.start) {
    return [right, left];
  }
  return [left, right];
}

/**
 * The time strictly between two dates or periods: from the millisecond after
 * the earlier one ends to the millisecond before the later one starts. A date
 * counts as its own millisecond. Order does not matter.
 *
 * @example
 * gap(period(new Date(2026, 2, 2), "day"), period(new Date(2026, 2, 5), "day"));
 * // { start: Mar 3, end: Mar 4 23:59:59.999, unit: "custom" }
 * gap(period(new Date(2026, 2, 2), "day"), period(new Date(2026, 2, 3), "day")); // undefined: they touch
 *
 * @param from - One date or period
 * @param to - The other date or period
 * @returns The custom period between them, or undefined when they touch or overlap
 */
function gap(from: TimePoint, to: TimePoint): Period | undefined {
  const [first, second] = inOrder(spanOf(from), spanOf(to));
  const start = first.end + ONE_MS;
  const end = second.start - ONE_MS;
  if (start > end) {
    return undefined;
  }
  return { end: new Date(end), start: new Date(start), unit: "custom" };
}

export { gap };
