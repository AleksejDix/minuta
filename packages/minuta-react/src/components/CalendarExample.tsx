import { MONDAY, SUNDAY } from "./week-start";
import { useMemo, useState } from "react";
import { CalendarHeader } from "./CalendarHeader";
import type { JSX } from "react";
import { NavigationControls } from "./NavigationControls";
import { PeriodDisplay } from "./PeriodDisplay";
import type { WeekStart } from "./week-start";
import { WeekdayRow } from "./WeekdayRow";
import { WeeksGrid } from "./WeeksGrid";
import { createNativeAdapter } from "minuta/native";
import { useMinuta } from "#src/use-minuta";
import { usePeriod } from "#src/use-period";

type CalendarExampleProps = Readonly<{
  /** Called with the start of the clicked day */
  onSelectDate?: (date: Readonly<Date>) => void;
}>;

const SUNDAY_FIRST = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONDAY_FIRST = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function weekdayLabels(weekStartsOn: WeekStart): readonly string[] {
  if (weekStartsOn === SUNDAY) {
    return SUNDAY_FIRST;
  }
  return MONDAY_FIRST;
}

/**
 * Batteries-included calendar that mirrors the React example app.
 * Ship it from the package so docs + sandboxes can import it directly.
 *
 * @param props - Component props
 * @param props.onSelectDate - Called with the start of the clicked day
 * @returns The calendar element
 */
function CalendarExample({
  onSelectDate,
}: CalendarExampleProps = {}): JSX.Element {
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStart>(MONDAY);

  // PATTERN: Memoize adapters so React recreates them when config changes.
  const adapter = useMemo(
    () => createNativeAdapter({ weekStartsOn }),
    [weekStartsOn]
  );

  const minuta = useMinuta({
    adapter,
    date: new Date(),
  });

  const month = usePeriod(minuta, "month");

  return (
    <section className="calendar-shell" data-testid="calendar-example">
      <CalendarHeader
        weekStartsOn={weekStartsOn}
        onWeekStartChange={setWeekStartsOn}
      />
      <PeriodDisplay month={month} now={minuta.now} />
      <NavigationControls minuta={minuta} targetPeriod={month} />
      <WeekdayRow labels={weekdayLabels(weekStartsOn)} />
      <WeeksGrid minuta={minuta} month={month} onSelectDate={onSelectDate} />
    </section>
  );
}

export { CalendarExample };
