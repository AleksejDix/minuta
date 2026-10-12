import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateField } from "./DateField";
import type { JSX } from "react";
import { LocaleSelect } from "./LocaleSelect";

type DateFieldDemoProps = Readonly<{
  locale: string;
  locales: readonly string[];
  onChange: (date: Readonly<Date> | undefined) => void;
  onLocaleChange: (locale: string) => void;
  value: Readonly<Date> | undefined;
}>;

const TITLE = "Date field";
const DESCRIPTION =
  "datefield + input-dom: type, paste or step with the arrow keys.";

function DateFieldDemo({
  locale,
  locales,
  onChange,
  onLocaleChange,
  value,
}: DateFieldDemoProps): JSX.Element {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{TITLE}</CardTitle>
        <CardDescription>{DESCRIPTION}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <LocaleSelect
          locale={locale}
          locales={locales}
          onChange={onLocaleChange}
        />
        <DateField locale={locale} onChange={onChange} value={value} />
      </CardContent>
    </Card>
  );
}

export { DateFieldDemo };
