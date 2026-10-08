import type { JSX } from "react";
import { useMemo } from "react";
import { useMinutaContext } from "#src/minuta-context";

type CalendarWeekdaysProps = Readonly<{
  /** Locale of the weekday labels, default: `"en-US"` */
  locale?: string | undefined;
}>;

const DEFAULT_LOCALE = "en-US";

/**
 * Short weekday labels in the week order of the units.
 *
 * @param props - Component props
 * @param props.locale - Locale of the weekday labels
 * @returns The weekday row
 */
function CalendarWeekdays({
  locale = DEFAULT_LOCALE,
}: CalendarWeekdaysProps): JSX.Element {
  const { browsing, divide, period } = useMinutaContext();

  const labels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
    const week = period(browsing.start, "week");
    return divide(week, "day").map((day) => formatter.format(day.start));
  }, [browsing, divide, locale, period]);

  return (
    <div className="weekday-grid">
      {labels.map((label) => (
        <span key={label}>{label}</span>
      ))}
    </div>
  );
}

export { CalendarWeekdays };
export type { CalendarWeekdaysProps };
