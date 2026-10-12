import { useCallback, useState } from "react";
import { DateFieldDemo } from "./DateFieldDemo";
import { DemoCalendar } from "./DemoCalendar";
import type { JSX } from "react";
import { PageHeader } from "./PageHeader";
import type { Period } from "minuta-react";

const LOCALES = ["de-CH", "en-US", "en-GB", "ja-JP", "ko-KR", "fr-FR"];
const DEFAULT_LOCALE = "de-CH";

function App(): JSX.Element {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [value, setValue] = useState<Readonly<Date>>();

  // A fresh Date so re-picking the same day still resets the field
  const handleSelect = useCallback((day: Period) => {
    setValue(new Date(day.start));
  }, []);

  return (
    <main className="mx-auto flex min-h-svh max-w-4xl flex-col gap-8 px-4 py-12">
      <PageHeader />
      <div className="flex flex-wrap items-start gap-6">
        <DateFieldDemo
          locale={locale}
          locales={LOCALES}
          onChange={setValue}
          onLocaleChange={setLocale}
          value={value}
        />
        <DemoCalendar locale={locale} onSelect={handleSelect} />
      </div>
    </main>
  );
}

export { App };
