/**
 * Hour, minute and second specs from elapsed time. Rebuilding a date from
 * local fields (`new Date(y, m, d, h)`) resolves the repeated hour of a DST
 * fall-back night to its first occurrence; subtracting the time past the
 * boundary keeps each occurrence apart.
 */

import type { UnitSpec } from "#src/types";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const ONE_MS = 1;

/**
 * A spec whose boundaries lie `msPast(date)` before `date`, `size` apart.
 *
 * @param size - Length of one unit in ms
 * @param msPast - Milliseconds of `date` past the unit's start
 * @returns The unit spec
 */
function elapsedSpec(
  size: number,
  msPast: (date: Readonly<Date>) => number
): UnitSpec {
  /**
   * The start of the unit containing `date`.
   *
   * @param date - Any date
   * @returns The unit's first millisecond
   */
  function startOf(date: Readonly<Date>): Date {
    return new Date(date.getTime() - msPast(date));
  }
  return {
    add: (date, amount) => new Date(date.getTime() + amount * size),
    diff: (from, to) => Math.trunc((to.getTime() - from.getTime()) / size),
    endOf: (date) => new Date(startOf(date).getTime() + size - ONE_MS),
    startOf,
  };
}

const elapsedSecond: UnitSpec = elapsedSpec(MS_PER_SECOND, (date) =>
  date.getMilliseconds()
);

const elapsedMinute: UnitSpec = elapsedSpec(
  MS_PER_MINUTE,
  (date) => date.getSeconds() * MS_PER_SECOND + date.getMilliseconds()
);

// Local minutes, so zones offset by 30 or 45 minutes start hours correctly
const elapsedHour: UnitSpec = elapsedSpec(
  MS_PER_HOUR,
  (date) =>
    date.getMinutes() * MS_PER_MINUTE +
    date.getSeconds() * MS_PER_SECOND +
    date.getMilliseconds()
);

export { elapsedHour, elapsedMinute, elapsedSecond };
