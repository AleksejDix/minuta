import type { Period } from "#src/types";
import { assertValidDate } from "#src/units";

/**
 * Move one edge of a period while keeping the other fixed.
 *
 * Returns undefined if the new edge crosses the fixed edge.
 *
 * @param period - The period to resize
 * @param edge - Which edge to move
 * @param newDate - The new date for that edge
 * @returns The resized custom period, or undefined if the edges would cross
 *
 * @example
 * const meeting = range(new Date(2026, 2, 29, 9, 0), new Date(2026, 2, 29, 10, 0))
 * resize(meeting, 'end', new Date(2026, 2, 29, 11, 30))
 * // → { start: 9:00, end: 11:30, unit: "custom" }
 */
function resize(
  period: Period,
  edge: "start" | "end",
  newDate: Readonly<Date>
): Period | undefined {
  assertValidDate(newDate, "newDate");
  let { end, start } = period;
  if (edge === "start") {
    start = newDate;
  } else {
    end = newDate;
  }

  if (start.getTime() > end.getTime()) {
    return undefined;
  }

  return { end, start, unit: "custom" };
}

export { resize };
