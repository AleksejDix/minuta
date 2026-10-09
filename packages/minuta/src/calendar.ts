/**
 * Calendar grids as a plugin: context-first functions, plus the `calendar`
 * object to pass to `withUnits` (or `bind`) with your units.
 *
 * @example
 * import { withUnits } from "minuta/core";
 * import { calendar } from "minuta/calendar";
 *
 * const time = withUnits(nativeUnits({ weekStartsOn: "sunday" }), { plugins: [calendar] });
 * time.monthGrid(new Date());
 *
 * @module minuta/calendar
 */
import { dayGridWith, monthGridWith, yearGridWith } from "#src/calendar/index";

/**
 * The calendar plugin: pass it to `withUnits(units, { plugins: [calendar] })`
 * or to `bind(units, calendar)`.
 */
const calendar: Readonly<{
  dayGrid: typeof dayGridWith;
  monthGrid: typeof monthGridWith;
  yearGrid: typeof yearGridWith;
}> = {
  dayGrid: dayGridWith,
  monthGrid: monthGridWith,
  yearGrid: yearGridWith,
};

export { calendar };
export { dayGridWith, monthGridWith, yearGridWith } from "#src/calendar/index";
export type {
  DayGrid,
  HourSlot,
  MonthGrid,
  YearGrid,
} from "#src/calendar/index";
