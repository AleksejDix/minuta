import { DateTime } from "luxon";

// Far enough back to read the offset before a clock change
const DAY_MS = 86_400_000;
const MS_PER_MINUTE = 60_000;

/**
 * The first occurrence of a moment's wall time. Luxon keeps the offset it
 * starts from, so on a night the clocks go back at midnight (Azores, Oct 25
 * 2026: 01:00 → 00:00) `startOf("day")` from the afternoon is the second
 * midnight, and the hour before it belongs to no day. Native `Date` and
 * Temporal take the first.
 *
 * @example
 * // TZ=Atlantic/Azores
 * firstOccurrence(new Date("2026-10-25T01:00:00Z")); // 2026-10-25T00:00:00Z
 *
 * @param date - A moment
 * @returns The earliest moment with the same wall time
 */
function firstOccurrence(date: Readonly<Date>): Date {
  const wall = DateTime.fromJSDate(date);
  const before = DateTime.fromMillis(wall.toMillis() - DAY_MS);
  const earlier = DateTime.fromMillis(
    wall.toMillis() - (before.offset - wall.offset) * MS_PER_MINUTE
  );
  if (
    earlier < wall &&
    earlier.toISO({ includeOffset: false }) ===
      wall.toISO({ includeOffset: false })
  ) {
    return earlier.toJSDate();
  }
  return new Date(date);
}

export { firstOccurrence };
