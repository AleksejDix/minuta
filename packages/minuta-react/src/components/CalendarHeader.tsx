import type { JSX } from "react";
import type { WeekStart } from "./week-start";
import { WeekStartToggle } from "./WeekStartToggle";

type CalendarHeaderProps = Readonly<{
  onWeekStartChange: (value: WeekStart) => void;
  weekStartsOn: WeekStart;
}>;

const TITLE = "Minuta React Demo";
const SUBHEADING =
  "Derived periods, divide() pattern, and adapter reactivity in one hook.";

function CalendarHeader({
  onWeekStartChange,
  weekStartsOn,
}: CalendarHeaderProps): JSX.Element {
  return (
    <header className="calendar-header">
      <div>
        <h1>{TITLE}</h1>
        <p className="subheading">{SUBHEADING}</p>
      </div>
      <WeekStartToggle
        weekStartsOn={weekStartsOn}
        onChange={onWeekStartChange}
      />
    </header>
  );
}

export { CalendarHeader };
