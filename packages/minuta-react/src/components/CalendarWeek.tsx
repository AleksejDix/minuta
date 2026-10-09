import type { JSX, ReactNode } from "react";
import type { Period } from "minuta/core";
import { useCalendarContext } from "./calendar-context";
import { useMinutaContext } from "#src/minuta-context";

type CalendarWeekProps = Readonly<{
  /** Renders one day */
  renderDay: (day: Period) => ReactNode;
  /** The 7 days of the week */
  week: readonly Period[];
}>;

/**
 * One row of the grid: a cell per day, marked `aria-selected` for the
 * selected day.
 *
 * @param props - Component props
 * @param props.renderDay - Renders one day
 * @param props.week - The days of the week
 * @returns The table row
 */
function CalendarWeek({ renderDay, week }: CalendarWeekProps): JSX.Element {
  const { same } = useMinutaContext();
  const { selected } = useCalendarContext();

  return (
    <tr className="week-row">
      {week.map((day) => (
        <td
          className="grid-cell"
          key={day.start.toISOString()}
          aria-selected={selected !== undefined && same(selected, day, "day")}
        >
          {renderDay(day)}
        </td>
      ))}
    </tr>
  );
}

export { CalendarWeek };
