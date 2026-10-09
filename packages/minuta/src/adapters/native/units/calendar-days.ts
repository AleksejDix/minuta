const MS_PER_DAY = 86_400_000;

function dayNumber(date: Readonly<Date>): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Calendar days between the dates' local days. Uses UTC day numbers, so a
 * 23- or 25-hour DST day still counts as one day.
 *
 * @example
 * calendarDaysBetween(new Date(2026, 2, 1), new Date(2026, 3, 1)); // 31, in any time zone
 *
 * @param from - Start date (its time of day is ignored)
 * @param to - End date (its time of day is ignored)
 * @returns Whole calendar days from `from` to `to`; negative when `to` is earlier
 */
function calendarDaysBetween(from: Readonly<Date>, to: Readonly<Date>): number {
  return Math.round((dayNumber(to) - dayNumber(from)) / MS_PER_DAY);
}

export { calendarDaysBetween };
