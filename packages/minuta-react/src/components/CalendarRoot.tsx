import type { JSX, ReactNode } from "react";
import type { Period, Units } from "minuta/core";
import { CalendarSelection } from "./CalendarSelection";
import { MinutaRoot } from "#src/minuta-root";

type CalendarRootProps = Readonly<{
  children?: ReactNode;
  /** Initially browsed date, default: now */
  date?: Readonly<Date> | undefined;
  /** Called with the clicked day */
  onSelect?: ((day: Period) => void) | undefined;
  /** Unit specs, default: `nativeUnits()` (weeks start on Monday) */
  units?: Units | undefined;
}>;

/**
 * Owns the state of a month calendar: a `MinutaRoot` browsing months plus
 * the selected day. Compose it with `CalendarHeader`, `CalendarWeekdays`,
 * `CalendarGrid` and `CalendarDay`.
 *
 * @param props - Component props
 * @param props.children - The calendar parts
 * @param props.date - Initially browsed date
 * @param props.onSelect - Called with the clicked day
 * @param props.units - Unit specs
 * @returns The calendar element
 */
// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- ReactNode contains ReactElement<any>, which cannot be deeply readonly
function CalendarRoot({
  children,
  date,
  onSelect,
  units,
}: CalendarRootProps): JSX.Element {
  return (
    <MinutaRoot date={date} unit="month" units={units}>
      <CalendarSelection onSelect={onSelect}>{children}</CalendarSelection>
    </MinutaRoot>
  );
}

export { CalendarRoot };
export type { CalendarRootProps };
