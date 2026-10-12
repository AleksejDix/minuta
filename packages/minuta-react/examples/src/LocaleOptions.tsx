import { SelectContent, SelectItem } from "@/components/ui/select";
import type { JSX } from "react";

function LocaleOptions({
  locales,
}: Readonly<{ locales: readonly string[] }>): JSX.Element {
  return (
    <SelectContent>
      {locales.map((option) => (
        <SelectItem key={option} value={option}>
          {option}
        </SelectItem>
      ))}
    </SelectContent>
  );
}

export { LocaleOptions };
