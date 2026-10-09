import type { JSX, ReactNode } from "react";
import { CalendarDay } from "./CalendarDay";
import { CalendarWeek } from "./CalendarWeek";
import { CalendarWeekdays } from "./CalendarWeekdays";
import type { Period } from "minuta/core";
import { monthGridWith } from "minuta/calendar";
import { useCalendarContext } from "./calendar-context";
import { useMemo } from "react";
import { useMinutaContext } from "#src/minuta-context";

type CalendarGridProps = Readonly<{
  /** Renders one day, default: `<CalendarDay day={day} locale={locale} />` */
  children?: ((day: Period) => ReactNode) | undefined;
  /** Locale of the weekday headers and the default days, default: `"en-US"` */
  locale?: string | undefined;
}>;

const DEFAULT_LOCALE = "en-US";
const DAYS_PER_WEEK = 7;

function toWeeks(days: readonly Period[]): readonly (readonly Period[])[] {
  const weeks: Period[][] = [];
  for (let index = 0; index < days.length; index += DAYS_PER_WEEK) {
    weeks.push(days.slice(index, index + DAYS_PER_WEEK));
  }
  return weeks;
}

function weekKey(week: readonly Period[]): string {
  const [first] = week;
  if (first === undefined) {
    return "";
  }
  return first.start.toISOString();
}

/**
 * The stable month grid of the browsed month (`role="grid"`, labelled by the
 * month heading): the weekday header row, then 6 weeks of 7 days, starting
 * with the week that contains the first of the month.
 *
 * @param props - Component props
 * @param props.children - Renders one day
 * @param props.locale - Locale of the weekday headers and the default days
 * @returns The grid element
 */
function CalendarGrid({
  children,
  locale = DEFAULT_LOCALE,
}: CalendarGridProps): JSX.Element {
  const { browsing, units } = useMinutaContext();
  const { labelId } = useCalendarContext();
  const weeks = useMemo(
    () => toWeeks(monthGridWith(units, browsing.start).periods),
    [browsing, units]
  );
  const renderDay = useMemo(() => {
    if (children !== undefined) {
      return children;
    }
    function renderDefaultDay(day: Period): ReactNode {
      return <CalendarDay day={day} locale={locale} />;
    }
    return renderDefaultDay;
  }, [children, locale]);

  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role -- The APG date picker grid is a table with role="grid"
    <table className="weeks-grid" role="grid" aria-labelledby={labelId}>
      <CalendarWeekdays locale={locale} />
      <tbody>
        {weeks.map((week) => (
          <CalendarWeek key={weekKey(week)} renderDay={renderDay} week={week} />
        ))}
      </tbody>
    </table>
  );
}

export { CalendarGrid };
export type { CalendarGridProps };
