// oxlint-disable-next-line import/no-unassigned-import -- installs Temporal before anything below computes
import "./temporal-ready";
import { useCallback, useState } from "react";
import { DateFieldDemo } from "./DateFieldDemo";
import { DemoCalendar } from "./DemoCalendar";
import type { JSX } from "react";
import type { Period } from "@aleksejdix/minuta-react";

const LOCALES = ["de-CH", "en-US", "en-GB", "ja-JP", "ko-KR", "fr-FR"];
const DEFAULT_LOCALE = "de-CH";
const MONTH_OFFSET = 1;

/**
 * The date field and the calendar sharing one date and locale, as mounted by
 * the demo app and the docs.
 *
 * @returns Both cards
 */
function Playground(): JSX.Element {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [value, setValue] = useState<Readonly<Date>>();

  /*
   * The field still takes a Date: the day's calendar date at local midnight,
   * a fresh one so re-picking the same day still resets the field
   */
  const handleSelect = useCallback((day: Period) => {
    const { day: dayOfMonth, month, year } = day.start;
    setValue(new Date(year, month - MONTH_OFFSET, dayOfMonth));
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
