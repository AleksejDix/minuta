import type { JSX, ReactNode } from "react";
import { useDateFieldContext } from "./date-field-context";

const TO_DATE_LABEL = "toDate()";
const INVALID_DATE = "undefined (incomplete or invalid)";
const STATE_LABEL = "Input state";
const JSON_INDENT = 2;

function renderDate(date: Readonly<Date> | undefined): ReactNode {
  if (date === undefined) {
    return <em className="text-muted-foreground">{INVALID_DATE}</em>;
  }
  return <span className="font-medium">{date.toDateString()}</span>;
}

/**
 * The field's `toDate(...)` result and the mirrored input state.
 *
 * @returns The output element
 */
function DateFieldOutput(): JSX.Element {
  const { date, state } = useDateFieldContext();
  return (
    <output className="grid gap-2 text-sm">
      <div className="flex items-baseline justify-between gap-4">
        <code className="text-muted-foreground">{TO_DATE_LABEL}</code>
        {renderDate(date)}
      </div>
      <details>
        <summary className="cursor-pointer text-muted-foreground select-none hover:text-foreground">
          {STATE_LABEL}
        </summary>
        <pre className="mt-2 max-h-72 overflow-auto rounded-md bg-muted p-3 font-mono text-xs">
          {JSON.stringify(state, null, JSON_INDENT)}
        </pre>
      </details>
    </output>
  );
}

export { DateFieldOutput };
