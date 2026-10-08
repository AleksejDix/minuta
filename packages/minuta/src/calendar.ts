/**
 * Calendar grids as a plugin: context-first functions, plus the `calendar`
 * object to `bind` to your units.
 *
 * @example
 * import { bind } from "minuta/core";
 * import { calendar } from "minuta/calendar";
 *
 * const grids = bind(nativeUnits({ weekStartsOn: 0 }), calendar);
 * grids.monthGrid(new Date());
 *
 * @module minuta/calendar
 */
import { dayGridWith, monthGridWith, yearGridWith } from "#src/calendar/index";

/**
 * The calendar plugin: pass it to `bind` together with your units.
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
