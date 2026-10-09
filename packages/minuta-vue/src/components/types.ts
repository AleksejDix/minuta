import type { Period, Units } from "minuta/core";

/**
 * Props of `<CalendarRoot>`.
 */
type CalendarRootProps = Readonly<{
  /** Initially browsed date, default: now */
  date?: Readonly<Date> | undefined;
  /** Unit specs, default `nativeUnits()`; the week start lives in the units */
  units?: Units | undefined;
}>;

/**
 * Props of `<CalendarHeader>`, `<CalendarWeekdays>` and `<CalendarDay>`.
 */
type CalendarLabelProps = Readonly<{
  /** BCP 47 locale of the labels, default "en-US" */
  locale?: string | undefined;
}>;

/**
 * Props of `<CalendarDay>`.
 */
type CalendarDayProps = CalendarLabelProps &
  Readonly<{
    /** The day period to render */
    day: Period;
  }>;

export type {
  CalendarDayProps,
  CalendarLabelProps as CalendarHeaderProps,
  CalendarLabelProps as CalendarWeekdaysProps,
  CalendarRootProps,
};
