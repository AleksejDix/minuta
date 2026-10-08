import type { Adapter } from "#src/types";

const DAYS_PER_WEEK = 7;
const NO_DAYS = 0;

/**
 * Move a date back to the first day of its week.
 *
 * @param adapter - The date adapter to use
 * @param weekStartsOn - First day of the week (0 = Sunday)
 * @param date - The date to move back
 * @returns The start of the grid week containing the date
 */
function weekGridStart(
  adapter: Readonly<Adapter>,
  weekStartsOn: number,
  date: Readonly<Date>
): Readonly<Date> {
  const daysToSubtract =
    (date.getDay() - weekStartsOn + DAYS_PER_WEEK) % DAYS_PER_WEEK;

  if (daysToSubtract > NO_DAYS) {
    return adapter.add(date, -daysToSubtract, "day");
  }
  return date;
}

export { DAYS_PER_WEEK, weekGridStart };
