import type { JSX, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { DateFieldContext } from "./date-field-context";
import { useDateField } from "./use-date-field";

type DateFieldRootProps = Readonly<{
  children?: ReactNode;
  /** Locale that decides the date format */
  locale: string;
  /** Called when the field's date changes, `undefined` while incomplete */
  onChange?: ((date: Readonly<Date> | undefined) => void) | undefined;
  /** A new value replaces the field's content */
  value?: Readonly<Date> | undefined;
}>;

function timeOf(date: Readonly<Date> | undefined): number | undefined {
  if (date === undefined) {
    return undefined;
  }
  return date.getTime();
}

/**
 * A new value from outside (the calendar) replaces the field's content.
 *
 * @param value - The value prop
 * @param time - Time of the field's current date
 * @param setDate - Replaces the field's content
 */
function useValue(
  value: Readonly<Date> | undefined,
  time: number | undefined,
  setDate: (date: Readonly<Date>) => void
): void {
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    if (value !== undefined && timeOf(value) !== time) {
      setDate(value);
    }
  }
}

/**
 * Report the field's date whenever its time changes.
 *
 * @param date - The field's date
 * @param time - Time of the field's date
 * @param onChange - Called with the new date
 */
function useReportChange(
  date: Readonly<Date> | undefined,
  time: number | undefined,
  onChange: DateFieldRootProps["onChange"]
): void {
  const reported = useRef(time);
  useEffect(() => {
    if (reported.current === time) {
      return;
    }
    reported.current = time;
    if (onChange !== undefined) {
      onChange(date);
    }
  }, [date, onChange, time]);
}

/**
 * Owns a segmented date field: the input-dom controller with datefield's
 * mask, arrow-key rotation and day clamping. Parts read it with
 * `useDateFieldContext()`.
 *
 * @param props - Component props
 * @param props.children - The field parts
 * @param props.locale - Locale that decides the date format
 * @param props.onChange - Called when the field's date changes
 * @param props.value - A new value replaces the field's content
 * @returns The context provider around the parts
 */
// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- ReactNode contains ReactElement<any>, which cannot be deeply readonly
function DateFieldRoot({
  children,
  locale,
  onChange,
  value,
}: DateFieldRootProps): JSX.Element {
  const { date, inputRef, setDate, state } = useDateField(locale, value);
  const time = timeOf(date);

  useValue(value, time, setDate);
  useReportChange(date, time, onChange);

  const field = useMemo(
    () => ({ date, inputRef, state }),
    [date, inputRef, state]
  );
  return (
    <DateFieldContext.Provider value={field}>
      {children}
    </DateFieldContext.Provider>
  );
}

export { DateFieldRoot };
