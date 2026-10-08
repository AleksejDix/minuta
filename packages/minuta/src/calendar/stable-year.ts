/**
 * StableYear — a grid of 52 or 53 full weeks for year visualizations.
 */
import type { Adapter, Period, Series } from "#src/types";
import { DAYS_PER_WEEK, weekGridStart } from "./grid-start";
import { divide } from "#src/operations/divide";

type StableYear = Series & {
  weekStartsOn: number;
  yearStart: Date;
};

const LAST_WEEKDAY_OFFSET = 6;
const NO_DAYS = 0;

function weekGridEnd(
  adapter: Readonly<Adapter>,
  weekStartsOn: number,
  date: Readonly<Date>
): Date {
  const daysToAdd =
    (weekStartsOn + LAST_WEEKDAY_OFFSET - date.getDay()) % DAYS_PER_WEEK;

  let gridEnd = date;
  if (daysToAdd > NO_DAYS) {
    gridEnd = adapter.add(date, daysToAdd, "day");
  }
  return adapter.endOf(gridEnd, "day");
}

/**
 * Creates a stable year grid: 52 or 53 week periods
 * covering all weeks that contain any days of the target year.
 *
 * @param adapter - The date adapter to use
 * @param weekStartsOn - First day of the week (0 = Sunday)
 * @param date - Any date within the target year
 * @returns The week periods with grid metadata
 */
function createStableYear(
  adapter: Readonly<Adapter>,
  weekStartsOn: number,
  date: Readonly<Date>
): StableYear {
  const yearStart = adapter.startOf(date, "year");
  const gridStart = weekGridStart(adapter, weekStartsOn, yearStart);
  const gridEnd = weekGridEnd(
    adapter,
    weekStartsOn,
    adapter.endOf(date, "year")
  );
  const gridPeriod: Period = { end: gridEnd, start: gridStart, type: "week" };
  const periods = divide(adapter, gridPeriod, "week");

  return { periods, weekStartsOn, yearStart };
}

export { createStableYear };
export type { StableYear };
