import { Input } from "@/components/ui/input";
import type { JSX } from "react";
import { Label } from "@/components/ui/label";
import { useDateFieldContext } from "./date-field-context";
import { useId } from "react";

type DateFieldInputProps = Readonly<{
  /** Visible label of the input */
  label: string;
}>;

/**
 * The labelled `<input>` the field's input-dom controller attaches to.
 *
 * @param props - Component props
 * @param props.label - Visible label of the input
 * @returns The labelled input
 */
function DateFieldInput({ label }: DateFieldInputProps): JSX.Element {
  const { inputRef } = useDateFieldContext();
  const id = useId();
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        ref={inputRef}
        id={id}
        inputMode="numeric"
        className="font-mono tabular-nums"
      />
    </div>
  );
}

export { DateFieldInput };
