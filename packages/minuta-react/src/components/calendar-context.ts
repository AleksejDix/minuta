import { createContext, useContext } from "react";
import type { Context } from "react";
import type { Period } from "minuta/core";

type CalendarContextValue = Readonly<{
  /** The one tabbable day of the browsed month */
  active: Period;
  /** Move the keyboard focus to a day, browsing to its month */
  focus: (day: Period) => void;
  /** Whether a day can't be selected */
  isDisabled: (day: Period) => boolean;
  /** Id of the month heading that labels the grid */
  labelId: string;
  /** Select a day: browse to it and report it through `onSelect` */
  select: (day: Period) => void;
  /** The last selected day */
  selected: Period | undefined;
  /** Whether the keyboard moved the focus to `day`; true only once */
  takeFocus: (day: Period) => boolean;
}>;

const CalendarContext: Context<CalendarContextValue | undefined> =
  createContext<CalendarContextValue | undefined>(undefined);

/**
 * The selection state provided by the closest `CalendarRoot`.
 *
 * @returns The selection state of the closest `CalendarRoot`
 */
function useCalendarContext(): CalendarContextValue {
  const calendar = useContext(CalendarContext);
  if (calendar === undefined) {
    throw new Error("Calendar parts must be used within <CalendarRoot>");
  }
  return calendar;
}

export { CalendarContext, useCalendarContext };
