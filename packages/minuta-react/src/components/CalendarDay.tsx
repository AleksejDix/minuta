import { useCallback, useMemo } from "react";
import type { JSX } from "react";
import type { Period } from "minuta/core";
import { useCalendarContext } from "./calendar-context";
import { useMinutaContext } from "#src/minuta-context";

type CalendarDayProps = Readonly<{
  /** The day period of this cell */
  day: Period;
  /** Locale of the day number and weekday title, default: `"en-US"` */
  locale?: string | undefined;
}>;

type DayLabels = Readonly<{ number: string; weekday: string }>;

type DayState = Readonly<{
  isOutside: boolean;
  isSelected: boolean;
  isToday: boolean;
}>;

const DEFAULT_LOCALE = "en-US";

/**
 * The day number and weekday of `date` in `timeZone`.
 *
 * @param date - The day's start
 * @param locale - BCP 47 locale
 * @param timeZone - The units' time zone, undefined for the runtime's
 * @returns Both labels
 */
function dayLabels(
  date: Readonly<Date>,
  locale: string,
  timeZone: string | undefined
): DayLabels {
  return {
    number: new Intl.DateTimeFormat(locale, {
      day: "numeric",
      timeZone,
    }).format(date),
    weekday: new Intl.DateTimeFormat(locale, {
      timeZone,
      weekday: "short",
    }).format(date),
  };
}

function dayClassName({ isOutside, isSelected, isToday }: DayState): string {
  const classes = ["day-cell"];
  if (isOutside) {
    classes.push("is-outside");
  }
  if (isToday) {
    classes.push("is-today");
  }
  if (isSelected) {
    classes.push("is-selected");
  }
  return classes.join(" ");
}

function ariaCurrent(isToday: boolean): "date" | undefined {
  if (isToday) {
    return "date";
  }
  return undefined;
}

/**
 * One day cell: dimmed outside the browsed month, marked when it is today or
 * selected; a click selects it.
 *
 * @param props - Component props
 * @param props.day - The day period of this cell
 * @param props.locale - Locale of the labels
 * @returns The day button
 */
function CalendarDay({
  day,
  locale = DEFAULT_LOCALE,
}: CalendarDayProps): JSX.Element {
  const { browsing, contains, now, same, units } = useMinutaContext();
  const { select, selected } = useCalendarContext();
  const state: DayState = {
    isOutside: !contains(browsing, day.start),
    isSelected: selected !== undefined && same(selected, day, "day"),
    isToday: contains(day, now.start),
  };
  const labels = useMemo(
    () => dayLabels(day.start, locale, units.timeZone),
    [day, locale, units]
  );

  const handleClick = useCallback(() => {
    select(day);
  }, [day, select]);

  return (
    <button
      type="button"
      className={dayClassName(state)}
      onClick={handleClick}
      title={labels.weekday}
      aria-pressed={state.isSelected}
      aria-current={ariaCurrent(state.isToday)}
    >
      <span className="date-number">{labels.number}</span>
      <span className="weekday-label">{labels.weekday}</span>
    </button>
  );
}

export { CalendarDay };
export type { CalendarDayProps };
