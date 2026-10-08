import type { CSSProperties, JSX, ReactNode } from "react";
import { useDateFieldContext } from "./date-field-context";

const TO_DATE_LABEL = "toDate():";
const INVALID_DATE = "undefined (incomplete or invalid)";
const JSON_INDENT = 2;
const STATE_STYLE: CSSProperties = { fontSize: "0.75rem", margin: 0 };

function renderDate(date: Readonly<Date> | undefined): ReactNode {
  if (date === undefined) {
    return <em>{INVALID_DATE}</em>;
  }
  return date.toDateString();
}

/**
 * The field's `toDate(...)` result and the mirrored input state.
 *
 * @returns The output element
 */
function DateFieldOutput(): JSX.Element {
  const { date, state } = useDateFieldContext();
  return (
    <output>
      <div>
        <strong>{TO_DATE_LABEL}</strong> {renderDate(date)}
      </div>
      <pre style={STATE_STYLE}>{JSON.stringify(state, null, JSON_INDENT)}</pre>
    </output>
  );
}

export { DateFieldOutput };
