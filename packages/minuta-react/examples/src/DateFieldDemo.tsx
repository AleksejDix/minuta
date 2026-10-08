import type { CSSProperties, JSX } from "react";
import { DateFieldInput } from "./DateFieldInput";
import { DateFieldOutput } from "./DateFieldOutput";
import { DateFieldRoot } from "./DateFieldRoot";
import { LocaleSelect } from "./LocaleSelect";

type DateFieldDemoProps = Readonly<{
  locale: string;
  locales: readonly string[];
  onChange: (date: Readonly<Date> | undefined) => void;
  onLocaleChange: (locale: string) => void;
  value: Readonly<Date> | undefined;
}>;

const TITLE = "datefield + input-dom";
const DATE_LABEL = "Date";
const SECTION_STYLE: CSSProperties = {
  display: "grid",
  gap: "1rem",
  minWidth: "20rem",
};
const TITLE_STYLE: CSSProperties = { margin: 0 };

function DateFieldDemo({
  locale,
  locales,
  onChange,
  onLocaleChange,
  value,
}: DateFieldDemoProps): JSX.Element {
  return (
    <section style={SECTION_STYLE}>
      <h2 style={TITLE_STYLE}>{TITLE}</h2>
      <LocaleSelect
        locale={locale}
        locales={locales}
        onChange={onLocaleChange}
      />
      <DateFieldRoot locale={locale} value={value} onChange={onChange}>
        <DateFieldInput label={DATE_LABEL} />
        <DateFieldOutput />
      </DateFieldRoot>
    </section>
  );
}

export { DateFieldDemo };
