import type { Period, ReadonlyPeriod } from "#src/types";

/**
 * Move one edge of a period while keeping the other fixed.
 *
 * Returns null if the new edge crosses the fixed edge.
 *
 * @param period - The period to resize
 * @param edge - Which edge to move
 * @param newDate - The new date for that edge
 * @returns The resized custom period, or null if the edges would cross
 *
 * @example
 * const meeting = createPeriod(new Date(2026, 2, 29, 9, 0), new Date(2026, 2, 29, 10, 0))
 * resize(meeting, 'end', new Date(2026, 2, 29, 11, 30))
 * // → { start: 9:00, end: 11:30, type: "custom" }
 */
function resize(
  period: ReadonlyPeriod,
  edge: "start" | "end",
  newDate: Readonly<Date>
): Period | null {
  let { end, start } = period;
  if (edge === "start") {
    start = newDate;
  } else {
    end = newDate;
  }

  if (start.getTime() > end.getTime()) {
    // oxlint-disable-next-line unicorn/no-null -- Public API returns null when the edges cross
    return null;
  }

  return { end, start, type: "custom" };
}

export { resize };
