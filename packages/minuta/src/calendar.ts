/**
 * Calendar grids and weekday checks (`isWeekday`, `isWeekend` with the
 * units' weekend): context-first functions, plus `calendar(units)` that
 * binds them all to your units.
 *
 * @example
 * import { calendar } from "@aleksejdix/minuta/calendar";
 * import { createUnits } from "@aleksejdix/minuta/core";
 *
 * const grids = calendar(createUnits({ weekStartsOn: "sunday" }));
 * grids.monthGrid(Temporal.Now.plainDateISO());
 *
 * @module minuta/calendar
 */
import type { DayGrid, MonthGrid, YearGrid } from "#src/calendar/index";
import type { Period, TimeValue, Units } from "#src/types";
import { dayGridWith, monthGridWith, yearGridWith } from "#src/calendar/index";
import { isWeekdayWith, isWeekendWith } from "#src/operations/index";

/**
 * The calendar functions, bound to one set of units.
 */
type Calendar = Readonly<{
  dayGrid: (value: TimeValue) => DayGrid;
  isWeekday: (period: Period) => boolean;
  isWeekend: (period: Period) => boolean;
  monthGrid: (value: TimeValue) => MonthGrid;
  yearGrid: (value: TimeValue) => YearGrid;
}>;

/**
 * Bind the calendar functions to `units`: `monthGrid(date)` instead of
 * `monthGridWith(units, date)`.
 *
 * @example
 * const grids = calendar(createUnits({ weekStartsOn: "sunday" }));
 * grids.monthGrid(Temporal.Now.plainDateISO()); // 6 weeks, from a Sunday
 * grids.isWeekend(period(Temporal.PlainDate.from("2026-03-21"), "day")); // true
 *
 * @param units - Unit specs to bind
 * @returns The calendar functions without the `units` parameter
 */
function calendar(units: Units): Calendar {
  return {
    dayGrid: (value) => dayGridWith(units, value),
    isWeekday: (period) => isWeekdayWith(units, period),
    isWeekend: (period) => isWeekendWith(units, period),
    monthGrid: (value) => monthGridWith(units, value),
    yearGrid: (value) => yearGridWith(units, value),
  };
}

export { calendar };
export { dayGridWith, monthGridWith, yearGridWith } from "#src/calendar/index";
export { isWeekdayWith, isWeekendWith } from "#src/operations/index";
export type { Calendar };
export type {
  DayGrid,
  HourSlot,
  MonthGrid,
  YearGrid,
} from "#src/calendar/index";
