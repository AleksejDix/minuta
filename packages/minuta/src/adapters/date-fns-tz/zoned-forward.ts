import { fromZonedTime, toZonedTime } from "date-fns-tz";

// Far enough past a clock jump to read the offset after it
const HALF_DAY_MS = 43_200_000;

/**
 * The zone's offset at a moment, read the same way the wall clock is read
 * (date-fns-tz's own `getTimezoneOffset` can disagree right at a jump).
 *
 * @param date - The moment
 * @param timeZone - IANA zone
 * @returns The offset in milliseconds
 */
function offsetAt(date: Readonly<Date>, timeZone: string): number {
  return toZonedTime(date, timeZone).getTime() - date.getTime();
}

/**
 * The moment a wall-clock time in a zone names. A wall time the clocks jump
 * over (Santiago's midnight on Sep 6 2026: 00:00 → 01:00) resolves to where
 * they resume, as the built-in `Date` does; `fromZonedTime` alone places it
 * before the jump, on the previous day, so the jump is added.
 *
 * @param wall - The wall-clock time, as date-fns-tz zoned time
 * @param timeZone - IANA zone
 * @returns The moment, never before the wall time
 */
function fromZonedForward(wall: Readonly<Date>, timeZone: string): Date {
  const start = fromZonedTime(wall, timeZone);
  if (toZonedTime(start, timeZone).getTime() >= wall.getTime()) {
    return start;
  }
  const later = new Date(start.getTime() + HALF_DAY_MS);
  const jump = offsetAt(later, timeZone) - offsetAt(start, timeZone);
  return new Date(start.getTime() + jump);
}

export { fromZonedForward };
