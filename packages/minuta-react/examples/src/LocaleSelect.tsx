import type { JSX } from "react";
import { Label } from "@/components/ui/label";
import { LocaleOptions } from "./LocaleOptions";
import { LocaleTrigger } from "./LocaleTrigger";
import { Select } from "@/components/ui/select";
import { useId } from "react";

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
  return (
    <div className="grid gap-2">
      <Label htmlFor={id}>{LABEL}</Label>
      <Select value={locale} onValueChange={onChange}>
        <LocaleTrigger id={id} />
        <LocaleOptions locales={locales} />
      </Select>
    </div>
  );
}

export { LocaleSelect };
