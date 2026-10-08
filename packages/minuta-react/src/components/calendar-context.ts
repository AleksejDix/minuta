import { createContext, useContext } from "react";
import type { Context } from "react";
import type { Period } from "minuta/core";

type CalendarContextValue = Readonly<{
  /** Select a day: browse to it and report it through `onSelect` */
  select: (day: Period) => void;
  /** The last selected day */
  selected: Period | undefined;
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
