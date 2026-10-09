import type { JSX } from "react";
import { useMemo } from "react";
import { useMinutaContext } from "#src/minuta-context";

type CalendarWeekdaysProps = Readonly<{
  /** Locale of the weekday labels, default: `"en-US"` */
  locale?: string | undefined;
}>;

type WeekdayLabel = Readonly<{ full: string; short: string }>;

const DEFAULT_LOCALE = "en-US";

/**
 * The column headers of `CalendarGrid`: short weekday labels, abbreviating
 * the full weekday, in the week order of the units.
 *
 * @param props - Component props
 * @param props.locale - Locale of the weekday labels
 * @returns The table head with the weekday row
 */
function CalendarWeekdays({
  locale = DEFAULT_LOCALE,
}: CalendarWeekdaysProps): JSX.Element {
  const { browsing, divide, period, units } = useMinutaContext();

  const labels = useMemo((): readonly WeekdayLabel[] => {
    const { timeZone } = units;
    const full = new Intl.DateTimeFormat(locale, { timeZone, weekday: "long" });
    const short = new Intl.DateTimeFormat(locale, {
      timeZone,
      weekday: "short",
    });
    const week = period(browsing.start, "week");
    return divide(week, "day").map((day) => ({
      full: full.format(day.start),
      short: short.format(day.start),
    }));
  }, [browsing, divide, locale, period, units]);

  return (
    <thead className="weekday-grid">
      <tr>
        {labels.map((label) => (
          <th key={label.full} scope="col" abbr={label.full}>
            {label.short}
          </th>
        ))}
      </tr>
    </thead>
  );
}

export { CalendarWeekdays };
export type { CalendarWeekdaysProps };
