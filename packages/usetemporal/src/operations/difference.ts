import type { Period, Adapter } from "../types";

/**
 * Calculate the difference (gap) between two periods or dates
 *
 * This function calculates the time span between two temporal points.
 * When given two periods, it returns the gap between them.
 * When given dates, it returns the span from one to the other.
 *
 * @param adapter - The adapter instance
 * @param from - Starting period or date
 * @param to - Ending period or date
 * @returns A custom period representing the difference/gap
 *
 * @example
 * // Gap between two months
 * const jan = period(adapter, new Date(2024, 0, 15), "month");
 * const march = period(adapter, new Date(2024, 2, 15), "month");
 * const gap = difference(adapter, jan, march);
 * // Returns February as a custom period
 *
 * @example
 * // Duration between two dates
 * const start = new Date(2024, 0, 1);
 * const end = new Date(2024, 0, 10);
 * const duration = difference(adapter, start, end);
 * // Returns 9-day custom period from Jan 1 to Jan 10
 *
 * @example
 * // Reversed order is normalized (start <= end always)
 * const later = new Date(2024, 0, 10);
 * const earlier = new Date(2024, 0, 1);
 * const span = difference(adapter, later, earlier);
 * // Returns period from Jan 1 to Jan 10 (same as forward)
 */
export function difference(
  _adapter: Adapter,
  from: Period | Date,
  to: Period | Date
): Period {
  // Extract the relevant points from periods or dates
  // For periods: we need both start and end to determine direction
  // For dates: use the dates directly

  const fromStart = from instanceof Date ? from : from.start;
  const fromEnd = from instanceof Date ? from : from.end;
  const toStart = to instanceof Date ? to : to.start;
  const toEnd = to instanceof Date ? to : to.end;

  // Determine if this is forward or backward direction
  // If from.start <= to.start, it's forward, otherwise backward
  const isForward = fromStart.getTime() <= toStart.getTime();

  let start: Date;
  let end: Date;

  if (from instanceof Date && to instanceof Date) {
    // Date to Date: always normalize start <= end
    if (isForward) {
      start = from;
      end = to;
    } else {
      start = to;
      end = from;
    }
  } else if (from instanceof Date) {
    // Date to Period
    if (isForward) {
      // Forward: from date to start of period - 1ms
      start = from;
      end = new Date(toStart.getTime() - 1);
    } else {
      // Backward: from date to end of period
      start = from;
      end = toEnd;
    }
  } else if (to instanceof Date) {
    // Period to Date
    if (isForward) {
      // Forward: from end of period + 1ms to date
      start = new Date(fromEnd.getTime() + 1);
      end = to;
    } else {
      // Backward: from start of period to date
      start = fromStart;
      end = to;
    }
  } else {
    // Period to Period
    if (isForward) {
      // Forward: gap between them (end of first + 1ms to start of second - 1ms)
      start = new Date(fromEnd.getTime() + 1);
      end = new Date(toStart.getTime() - 1);
    } else {
      // Backward: from start of first to end of second (negative duration)
      start = fromStart;
      end = toEnd;
    }
  }

  return { start, end, type: "custom" };
}
