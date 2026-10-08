import type { CSSProperties, JSX } from "react";
import { useDateFieldContext } from "./date-field-context";

type DateFieldInputProps = Readonly<{
  /** Visible label of the input */
  label: string;
}>;

const LABEL_STYLE: CSSProperties = { display: "grid", gap: "0.25rem" };
const INPUT_STYLE: CSSProperties = {
  fontFamily: "monospace",
  fontSize: "1.5rem",
  padding: "0.5rem",
};

/**
 * The labelled `<input>` the field's input-dom controller attaches to.
 *
 * @param props - Component props
 * @param props.label - Visible label of the input
 * @returns The labelled input
 */
function DateFieldInput({ label }: DateFieldInputProps): JSX.Element {
  const { inputRef } = useDateFieldContext();
  return (
    <label style={LABEL_STYLE}>
      {label}
      <input ref={inputRef} inputMode="numeric" style={INPUT_STYLE} />
    </label>
  );
}

export { DateFieldInput };
