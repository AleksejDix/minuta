import type { JSX } from "react";
import type { MinutaBuilder } from "#src/types";
import type { ReadonlyPeriod } from "minuta";
import { useCallback } from "react";

type DayCellProps = Readonly<{
  day: ReadonlyPeriod;
  minuta: MinutaBuilder;
  month: ReadonlyPeriod;
  onSelectDate: ((date: Readonly<Date>) => void) | undefined;
}>;

const NO_STEPS = 0;

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

function dayClassName(isOutside: boolean, isToday: boolean): string {
  const classes = ["day-cell"];
  if (isOutside) {
    classes.push("is-outside");
  }
  if (isToday) {
    classes.push("is-today");
  }
  return classes.join(" ");
}

function DayCell({
  day,
  minuta,
  month,
  onSelectDate,
}: DayCellProps): JSX.Element {
  const isOutside = !minuta.contains(month, day.start);
  const isToday = minuta.isSame(day, minuta.now, "day");
  const weekday = dayFormatter.format(day.start);

  const handleClick = useCallback(() => {
    minuta.go(day, NO_STEPS);
    if (onSelectDate !== undefined) {
      onSelectDate(day.start);
    }
  }, [day, minuta, onSelectDate]);

  return (
    <button
      type="button"
      className={dayClassName(isOutside, isToday)}
      onClick={handleClick}
      title={weekday}
    >
      <span className="date-number">{day.start.getDate()}</span>
      <span className="weekday-label">{weekday}</span>
    </button>
  );
}

export { DayCell };
