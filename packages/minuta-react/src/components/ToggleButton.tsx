import type { JSX } from "react";
import type { WeekStart } from "./week-start";
import { useCallback } from "react";

type ToggleButtonProps = Readonly<{
  active: boolean;
  label: string;
  onSelect: (value: WeekStart) => void;
  value: WeekStart;
}>;

function toggleClassName(active: boolean): string {
  if (active) {
    return "toggle is-active";
  }
  return "toggle";
}

function ToggleButton({
  active,
  label,
  onSelect,
  value,
}: ToggleButtonProps): JSX.Element {
  const handleClick = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <button
      type="button"
      className={toggleClassName(active)}
      onClick={handleClick}
    >
      {label}
    </button>
  );
}

export { ToggleButton };
