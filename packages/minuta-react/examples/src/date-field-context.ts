import type { Context, RefObject } from "react";
import { createContext, useContext } from "react";
import type { InputState } from "input-state";

type DateFieldContextValue = Readonly<{
  /** The field's date, `undefined` while incomplete or invalid */
  date: Readonly<Date> | undefined;
  /** Ref for the `<input>` the controller attaches to */
  inputRef: RefObject<HTMLInputElement>;
  /** The field state, mirrored from input-dom */
  state: InputState;
}>;

const DateFieldContext: Context<DateFieldContextValue | undefined> =
  createContext<DateFieldContextValue | undefined>(undefined);

/**
 * The field state provided by the closest `DateFieldRoot`.
 *
 * @returns The field state of the closest `DateFieldRoot`
 */
function useDateFieldContext(): DateFieldContextValue {
  const field = useContext(DateFieldContext);
  if (field === undefined) {
    throw new Error(
      "useDateFieldContext() must be used within <DateFieldRoot>"
    );
  }
  return field;
}

export { DateFieldContext, useDateFieldContext };
