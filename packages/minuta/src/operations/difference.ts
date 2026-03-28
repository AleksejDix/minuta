import type { Period } from "../types";

/**
 * Calculate the gap or span between two temporal points.
 *
 * - Date + Date → span between them (normalized: start <= end)
 * - Period + Period → gap between them (from end of first to start of second)
 * - Mixed → gap from the date/period boundary to the other
 *
 * Returns a custom TimePeriod. If periods overlap, start > end (negative gap).
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
