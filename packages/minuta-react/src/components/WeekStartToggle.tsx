import { MONDAY, SUNDAY } from "./week-start";
import type { JSX } from "react";
import { ToggleButton } from "./ToggleButton";
import type { WeekStart } from "./week-start";

type WeekStartToggleProps = Readonly<{
  onChange: (value: WeekStart) => void;
  weekStartsOn: WeekStart;
}>;

const TOGGLE_LABEL = "Week starts on";
const SUNDAY_LABEL = "Sunday";
const MONDAY_LABEL = "Monday";

function WeekStartToggle({
  onChange,
  weekStartsOn,
}: WeekStartToggleProps): JSX.Element {
  return (
    <div className="toolbar-section">
      <p className="toolbar-label">{TOGGLE_LABEL}</p>
      <div className="toggle-group">
        <ToggleButton
          active={weekStartsOn === SUNDAY}
          label={SUNDAY_LABEL}
          onSelect={onChange}
          value={SUNDAY}
        />
        <ToggleButton
          active={weekStartsOn === MONDAY}
          label={MONDAY_LABEL}
          onSelect={onChange}
          value={MONDAY}
        />
      </div>
    </div>
  );
}

export { WeekStartToggle };
