import { useMemo, useState } from "react";
import { CalendarGrid } from "./CalendarGrid";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarRoot } from "./CalendarRoot";
import type { JSX } from "react";
import { MONDAY } from "./week-start";
import type { Period } from "minuta/core";
import type { WeekStart } from "./week-start";
import { WeekStartToggle } from "./WeekStartToggle";
import { nativeUnits } from "minuta/native";

type CalendarExampleProps = Readonly<{
  /** Called with the clicked day */
  onSelect?: ((day: Period) => void) | undefined;
}>;

const TITLE = "Minuta React Demo";

/**
 * A month calendar composed from the Calendar parts, with a week start
 * toggle that rebuilds the units.
 *
 * @param props - Component props
 * @param props.onSelect - Called with the clicked day
 * @returns The calendar element
 */
function CalendarExample({ onSelect }: CalendarExampleProps = {}): JSX.Element {
  const [weekStartsOn, setWeekStartsOn] = useState<WeekStart>(MONDAY);
  const units = useMemo(() => nativeUnits({ weekStartsOn }), [weekStartsOn]);

  return (
    <CalendarRoot units={units} onSelect={onSelect}>
      <div className="calendar-header">
        <h1>{TITLE}</h1>
        <WeekStartToggle
          weekStartsOn={weekStartsOn}
          onChange={setWeekStartsOn}
        />
      </div>
      <CalendarHeader />
      <CalendarGrid />
    </CalendarRoot>
  );
}

export { CalendarExample };
export type { CalendarExampleProps };
