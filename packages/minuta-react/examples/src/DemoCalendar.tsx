import {
  CalendarGrid,
  CalendarHeader,
  CalendarRoot,
} from "minuta-react/components";
import type { JSX } from "react";
import type { Period } from "minuta-react";

type DemoCalendarProps = Readonly<{
  locale: string;
  onSelect: (day: Period) => void;
}>;

function DemoCalendar({ locale, onSelect }: DemoCalendarProps): JSX.Element {
  return (
    <CalendarRoot onSelect={onSelect}>
      <CalendarHeader locale={locale} />
      <CalendarGrid locale={locale} />
    </CalendarRoot>
  );
}

export { DemoCalendar };
