import type { JSX } from "react";
import type { Period } from "minuta/core";
import { useCalendarContext } from "./calendar-context";
import { useCallback } from "react";
import { useMinutaContext } from "#src/minuta-context";

type CalendarDayProps = Readonly<{
  /** The day period of this cell */
  day: Period;
}>;

type DayState = Readonly<{
  isOutside: boolean;
  isSelected: boolean;
  isToday: boolean;
}>;

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

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
 * @returns The day button
 */
function CalendarDay({ day }: CalendarDayProps): JSX.Element {
  const { browsing, contains, isToday, now, same } = useMinutaContext();
  const { select, selected } = useCalendarContext();
  const state: DayState = {
    isOutside: !contains(browsing, day.start),
    isSelected: selected !== undefined && same(selected, day, "day"),
    isToday: isToday(now.start, day),
  };
  const weekday = weekdayFormatter.format(day.start);

  const handleClick = useCallback(() => {
    select(day);
  }, [day, select]);

  return (
    <button
      type="button"
      className={dayClassName(state)}
      onClick={handleClick}
      title={weekday}
      aria-pressed={state.isSelected}
      aria-current={ariaCurrent(state.isToday)}
    >
      <span className="date-number">{day.start.getDate()}</span>
      <span className="weekday-label">{weekday}</span>
    </button>
  );
}

export { CalendarDay };
export type { CalendarDayProps };
