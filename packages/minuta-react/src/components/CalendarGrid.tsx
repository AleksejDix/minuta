import { Fragment, useMemo } from "react";
import type { JSX, ReactNode } from "react";
import { CalendarDay } from "./CalendarDay";
import type { Period } from "minuta/core";
import { monthGridWith } from "minuta/calendar";
import { useMinutaContext } from "#src/minuta-context";

type CalendarGridProps = Readonly<{
  /** Renders one day, default: `<CalendarDay day={day} />` */
  children?: ((day: Period) => ReactNode) | undefined;
}>;

const DAYS_PER_WEEK = 7;

function toWeeks(days: readonly Period[]): readonly (readonly Period[])[] {
  const weeks: Period[][] = [];
  for (let index = 0; index < days.length; index += DAYS_PER_WEEK) {
    weeks.push(days.slice(index, index + DAYS_PER_WEEK));
  }
  return weeks;
}

function renderDefaultDay(day: Period): ReactNode {
  return <CalendarDay day={day} />;
}

function weekKey(week: readonly Period[]): string {
  const [first] = week;
  if (first === undefined) {
    return "";
  }
  return first.start.toISOString();
}

/**
 * The stable month grid of the browsed month: 6 weeks of 7 days, starting
 * with the week that contains the first of the month.
 *
 * @param props - Component props
 * @param props.children - Renders one day
 * @returns The grid element
 */
function CalendarGrid({
  children = renderDefaultDay,
}: CalendarGridProps): JSX.Element {
  const { browsing, units } = useMinutaContext();
  const weeks = useMemo(
    () => toWeeks(monthGridWith(units, browsing.start).periods),
    [browsing, units]
  );

  return (
    <div className="weeks-grid">
      {weeks.map((week) => (
        <div className="week-row" key={weekKey(week)}>
          {week.map((day) => (
            <Fragment key={day.start.toISOString()}>{children(day)}</Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}

export { CalendarGrid };
export type { CalendarGridProps };
