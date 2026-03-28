import type { Period } from "../types";

/**
 * Calculate the difference (gap) between two periods or dates.
 * Pure timestamp math — no adapter needed.
 *
 * @example
 * // Gap between two months
 * const gap = difference(jan, march);
 *
 * @example
 * // Span between two dates (normalized: start <= end)
 * const span = difference(new Date(2024, 0, 1), new Date(2024, 0, 10));
 */
export function difference(from: Period | Date, to: Period | Date): Period {
  const fromStart = from instanceof Date ? from : from.start;
  const fromEnd = from instanceof Date ? from : from.end;
  const toStart = to instanceof Date ? to : to.start;
  const toEnd = to instanceof Date ? to : to.end;

  const isForward = fromStart.getTime() <= toStart.getTime();

  let start: Date;
  let end: Date;

  if (from instanceof Date && to instanceof Date) {
    if (isForward) {
      start = from;
      end = to;
    } else {
      start = to;
      end = from;
    }
  } else if (from instanceof Date) {
    if (isForward) {
      start = from;
      end = new Date(toStart.getTime() - 1);
    } else {
      start = from;
      end = toEnd;
    }
  } else if (to instanceof Date) {
    if (isForward) {
      start = new Date(fromEnd.getTime() + 1);
      end = to;
    } else {
      start = fromStart;
      end = to;
    }
  } else {
    if (isForward) {
      start = new Date(fromEnd.getTime() + 1);
      end = new Date(toStart.getTime() - 1);
    } else {
      start = fromStart;
      end = toEnd;
    }
  }

  return { start, end, type: "custom" };
}
