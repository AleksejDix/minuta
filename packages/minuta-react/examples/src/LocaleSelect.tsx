import type { ChangeEvent, JSX } from "react";
import { useCallback, useId } from "react";
import { Label } from "@/components/ui/label";

type LocaleSelectProps = Readonly<{
  locale: string;
  locales: readonly string[];
  onChange: (locale: string) => void;
}>;

const LABEL = "Locale";

function LocaleSelect({
  locale,
  locales,
  onChange,
}: LocaleSelectProps): JSX.Element {
  const id = useId();
  const handleChange = useCallback(
    // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- React's synthetic events are mutable by design
    (event: ChangeEvent<HTMLSelectElement>) => {
      onChange(event.target.value);
    },
    [onChange]
  );
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{LABEL}</Label>
      <select
        id={id}
        value={locale}
        onChange={handleChange}
        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30"
      >
        {locales.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export { LocaleSelect };
