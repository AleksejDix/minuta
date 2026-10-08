import type { InjectionKey, ShallowRef } from "vue";
import type { Period } from "minuta/core";
import { inject } from "vue";

/**
 * What `<CalendarRoot>` provides to its parts.
 */
type CalendarContext = Readonly<{
  select: (day: Period) => void;
  selected: Readonly<ShallowRef<Period | undefined>>;
}>;

const calendarContextKey: InjectionKey<CalendarContext> =
  Symbol("CalendarContext");

/**
 * Reads the selection state of the nearest `<CalendarRoot>`.
 *
 * @returns The selection state of the nearest `<CalendarRoot>`
 */
function useCalendarContext(): CalendarContext {
  // oxlint-disable-next-line unicorn/no-useless-undefined -- An explicit default stops Vue from warning about a missing injection
  const calendar = inject(calendarContextKey, undefined);
  if (calendar === undefined) {
    throw new Error("Calendar parts must be used within <CalendarRoot>");
  }
  return calendar;
}

export { calendarContextKey, useCalendarContext };
