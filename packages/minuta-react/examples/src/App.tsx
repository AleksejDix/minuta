import {
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
  CalendarWeekdays,
} from "minuta-react/components";
import { useCallback, useState } from "react";
import { DateFieldDemo } from "./DateFieldDemo";
import type { JSX } from "react";
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
    <main className="app-shell">
      <DateFieldDemo
        locale={locale}
        locales={LOCALES}
        onChange={setValue}
        onLocaleChange={setLocale}
        value={value}
      />
      <CalendarRoot onSelect={handleSelect}>
        <CalendarHeader locale={locale} />
        <CalendarWeekdays locale={locale} />
        <CalendarGrid />
      </CalendarRoot>
    </main>
  );
}

export { App };
