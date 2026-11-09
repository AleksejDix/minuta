import type { JSX } from "react";
import { toLocaleString } from "@aleksejdix/minuta";
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
  const { browsing, divide, period } = useMinutaContext();

  const labels = useMemo((): readonly WeekdayLabel[] => {
    const week = period(browsing.start, "week");
    return divide(week, "day").map((day) => ({
      full: toLocaleString(day, locale, { weekday: "long" }),
      short: toLocaleString(day, locale, { weekday: "short" }),
    }));
  }, [browsing, divide, locale, period]);

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
