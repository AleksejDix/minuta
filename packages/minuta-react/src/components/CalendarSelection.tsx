import type { JSX, ReactNode } from "react";
import { useCallback, useId, useMemo, useState } from "react";
import { CalendarContext } from "./calendar-context";
import type { Period } from "minuta/core";
import { activeDay } from "./day-navigation";
import { useMinutaContext } from "#src/minuta-context";
import { useRovingFocus } from "./use-roving-focus";

type CalendarSelectionProps = Readonly<{
  children?: ReactNode;
  isDisabled: ((day: Period) => boolean) | undefined;
  onSelect: ((day: Period) => void) | undefined;
}>;

function isEnabled(): boolean {
  return false;
}

/**
 * Provides the selected and the focused day to the Calendar parts inside a
 * `MinutaRoot`.
 *
 * @param props - Component props
 * @param props.children - The calendar parts
 * @param props.isDisabled - Whether a day can't be selected
 * @param props.onSelect - Called with the clicked day
 * @returns The calendar section
 */
// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- ReactNode contains ReactElement<any>, which cannot be deeply readonly
function CalendarSelection({
  children,
  isDisabled = isEnabled,
  onSelect,
}: CalendarSelectionProps): JSX.Element {
  const minuta = useMinutaContext();
  const [selected, setSelected] = useState<Period>();
  const { focus, focused, remember, takeFocus } = useRovingFocus();
  const labelId = useId();

  const { browse, browsing, now, period } = minuta;
  const select = useCallback(
    (day: Period) => {
      remember(day);
      if (isDisabled(day)) {
        return;
      }
      setSelected(day);
      browse(day);
      if (onSelect !== undefined) {
        onSelect(day);
      }
    },
    [browse, isDisabled, onSelect, remember]
  );
  const active = useMemo(
    () =>
      activeDay(minuta, browsing, [
        focused,
        selected,
        period(now.start, "day"),
      ]),
    [browsing, focused, minuta, now, period, selected]
  );
  const calendar = useMemo(
    () => ({ active, focus, isDisabled, labelId, select, selected, takeFocus }),
    [active, focus, isDisabled, labelId, select, selected, takeFocus]
  );

  return (
    <CalendarContext.Provider value={calendar}>
      <section className="calendar-shell">{children}</section>
    </CalendarContext.Provider>
  );
}

export { CalendarSelection };
