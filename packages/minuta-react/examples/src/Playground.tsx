import { useCallback, useState } from "react";
import { DateFieldDemo } from "./DateFieldDemo";
import { DemoCalendar } from "./DemoCalendar";
import type { JSX } from "react";
import type { Period } from "minuta-react";

const LOCALES = ["de-CH", "en-US", "en-GB", "ja-JP", "ko-KR", "fr-FR"];
const DEFAULT_LOCALE = "de-CH";

/**
 * The date field and the calendar sharing one date and locale, as mounted by
 * the demo app and the docs.
 *
 * @returns Both cards
 */
function Playground(): JSX.Element {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [value, setValue] = useState<Readonly<Date>>();

  // A fresh Date so re-picking the same day still resets the field
  const handleSelect = useCallback((day: Period) => {
    setValue(new Date(day.start));
  }, []);

  return (
    <div className="minuta-playground flex flex-wrap items-start gap-6">
      <DateFieldDemo
        locale={locale}
        locales={LOCALES}
        onChange={setValue}
        onLocaleChange={setLocale}
        value={value}
      />
      <DemoCalendar locale={locale} onSelect={handleSelect} />
    </div>
  );
}

export { Playground };
