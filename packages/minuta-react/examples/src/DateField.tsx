import { DateFieldInput } from "./DateFieldInput";
import { DateFieldOutput } from "./DateFieldOutput";
import { DateFieldRoot } from "./DateFieldRoot";
import type { JSX } from "react";

const DATE_LABEL = "Date";

type DateFieldProps = Readonly<{
  locale: string;
  onChange: (date: Readonly<Date> | undefined) => void;
  value: Readonly<Date> | undefined;
}>;

function DateField({ locale, onChange, value }: DateFieldProps): JSX.Element {
  return (
    <DateFieldRoot locale={locale} value={value} onChange={onChange}>
      <DateFieldInput label={DATE_LABEL} />
      <DateFieldOutput />
    </DateFieldRoot>
  );
}

export { DateField };
