import type { CSSProperties, JSX } from "react";
import { useCallback } from "react";

type LocaleSelectProps = Readonly<{
  locale: string;
  locales: readonly string[];
  onChange: (locale: string) => void;
}>;

type ValueChange = Readonly<{ target: Readonly<{ value: string }> }>;

const LABEL = "Locale";
const LABEL_STYLE: CSSProperties = { display: "grid", gap: "0.25rem" };

function LocaleSelect({
  locale,
  locales,
  onChange,
}: LocaleSelectProps): JSX.Element {
  const handleChange = useCallback(
    (event: ValueChange) => {
      onChange(event.target.value);
    },
    [onChange]
  );

  return (
    <label style={LABEL_STYLE}>
      {LABEL}
      <select value={locale} onChange={handleChange}>
        {locales.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export { LocaleSelect };
