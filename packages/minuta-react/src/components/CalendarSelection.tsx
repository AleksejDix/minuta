import type { JSX, ReactNode } from "react";
import { useCallback, useMemo, useState } from "react";
import { CalendarContext } from "./calendar-context";
import type { Period } from "minuta/core";
import { useMinutaContext } from "#src/minuta-context";

type CalendarSelectionProps = Readonly<{
  children?: ReactNode;
  onSelect: ((day: Period) => void) | undefined;
}>;

/**
 * Provides the selected day to the Calendar parts inside a `MinutaRoot`.
 *
 * @param props - Component props
 * @param props.children - The calendar parts
 * @param props.onSelect - Called with the clicked day
 * @returns The calendar section
 */
// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- ReactNode contains ReactElement<any>, which cannot be deeply readonly
function CalendarSelection({
  children,
  onSelect,
}: CalendarSelectionProps): JSX.Element {
  const { browse } = useMinutaContext();
  const [selected, setSelected] = useState<Period>();

  const select = useCallback(
    (day: Period) => {
      setSelected(day);
      browse(day);
      if (onSelect !== undefined) {
        onSelect(day);
      }
    },
    [browse, onSelect]
  );
  const calendar = useMemo(() => ({ select, selected }), [select, selected]);

  return (
    <CalendarContext.Provider value={calendar}>
      <section className="calendar-shell">{children}</section>
    </CalendarContext.Provider>
  );
}

export { CalendarSelection };
