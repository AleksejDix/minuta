// oxlint-disable-next-line import/no-unassigned-import -- installs Temporal before anything below computes
import "./temporal-ready";
import { useCallback, useState } from "react";
import { DateFieldDemo } from "./DateFieldDemo";
import { DemoCalendar } from "./DemoCalendar";
import type { JSX } from "react";
import type { Period } from "@aleksejdix/minuta-react";
import type { Temporal } from "temporal-polyfill";

const LOCALES = ["de-CH", "en-US", "en-GB", "ja-JP", "ko-KR", "fr-FR"];
const DEFAULT_LOCALE = "de-CH";

/**
 * The date a calendar day starts on: a day period starts on a date, a
 * moment's is its wall-clock date.
 *
 * @param day - The picked day
 * @returns Its date
 */
function dateOf(day: Period): Readonly<Temporal.PlainDate> {
  if ("hour" in day.start) {
    return day.start.toPlainDate();
  }
  return day.start;
}

/**
 * The date field and the calendar sharing one date and locale, as mounted by
 * the demo app and the docs.
 *
 * @returns Both cards
 */
function Playground(): JSX.Element {
  const [locale, setLocale] = useState(DEFAULT_LOCALE);
  const [value, setValue] = useState<Readonly<Temporal.PlainDate>>();

  // The day's date; each pick is a new value, so re-picking resets the field
  const handleSelect = useCallback((day: Period) => {
    setValue(dateOf(day));
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
