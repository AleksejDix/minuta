import type { Period } from "#src/types";

const ONE_MS = 1;

type TimePoint = Period | Readonly<Date>;

type Bounds = Readonly<{ end: Date; start: Date }>;

function startOfPoint(point: TimePoint): Date {
  if ("start" in point) {
    return point.start;
  }
  return point;
}

function afterEnd(point: Period): Date {
  return new Date(point.end.getTime() + ONE_MS);
}

function beforeStart(point: Period): Date {
  return new Date(point.start.getTime() - ONE_MS);
}

function boundsFromDate(from: Readonly<Date>, to: TimePoint): Bounds {
  if (!("start" in to)) {
    if (from.getTime() <= to.getTime()) {
      return { end: to, start: from };
    }
    return { end: from, start: to };
  }
  if (from.getTime() <= to.start.getTime()) {
    return { end: beforeStart(to), start: from };
  }
  return { end: from, start: to.end };
}

function boundsFromPeriod(from: Period, to: TimePoint): Bounds {
  const isForward = from.start.getTime() <= startOfPoint(to).getTime();
  if (!("start" in to)) {
    if (isForward) {
      return { end: to, start: afterEnd(from) };
    }
    return { end: from.start, start: to };
  }
  if (isForward) {
    return { end: beforeStart(to), start: afterEnd(from) };
  }
  return { end: beforeStart(from), start: afterEnd(to) };
}

function computeBounds(from: TimePoint, to: TimePoint): Bounds {
  if ("start" in from) {
    return boundsFromPeriod(from, to);
  }
  return boundsFromDate(from, to);
}

/**
 * Calculate the gap or span between two time points.
 *
 * - Date + Date → span between them (normalized: start <= end)
 * - Period + Period → gap between them (from end of first to start of second)
 * - Mixed → gap from the date/period boundary to the other
 *
 * Returns a custom Period. Always start <= end.
 * If periods overlap or touch, returns a zero-duration period at the boundary.
 *
 * @param from - The first date or period
 * @param to - The second date or period
 * @returns A custom period spanning the gap
 */
function gap(from: TimePoint, to: TimePoint): Period {
  const { end, start } = computeBounds(from, to);

  // Normalize: if periods overlap, there's no gap — return zero-duration at boundary
  if (start.getTime() > end.getTime()) {
    return { end: start, start, unit: "custom" };
  }

  return { end, start, unit: "custom" };
}

export { gap };
