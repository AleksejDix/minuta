import type { Adapter, ReadonlyPeriod } from "#src/types";
import { derivePeriod } from "#src/operations/period";
import { isSame } from "#src/operations/is-same";

/**
 * Checks if a period represents today.
 *
 * @param adapter - The date adapter
 * @param now - The current date
 * @param period - The period to check
 * @returns True when the period is the day containing `now`
 */
function isToday(
  adapter: Readonly<Adapter>,
  now: Readonly<Date>,
  period: ReadonlyPeriod
): boolean {
  if (period.type !== "day") {
    return false;
  }

  const today = derivePeriod(adapter, now, "day");
  return isSame(adapter, period, today, "day");
}

export { isToday };
