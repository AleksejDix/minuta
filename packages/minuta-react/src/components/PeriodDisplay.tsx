import { DefinitionItem } from "./DefinitionItem";
import type { JSX } from "react";
import type { ReadonlyPeriod } from "minuta";

type PeriodDisplayProps = Readonly<{
  month: ReadonlyPeriod;
  now: ReadonlyPeriod;
}>;

const EYEBROW = "Browsing";
const RANGE_TERM = "Range";
const STATUS_TERM = "Status";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const rangeFormatter = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
});

function isSameMonth(month: ReadonlyPeriod, now: ReadonlyPeriod): boolean {
  return (
    month.start.getFullYear() === now.start.getFullYear() &&
    month.start.getMonth() === now.start.getMonth()
  );
}

function statusLabel(isCurrentMonth: boolean): string {
  if (isCurrentMonth) {
    return "Current month";
  }
  return "Historical view";
}

function PeriodDisplay({ month, now }: PeriodDisplayProps): JSX.Element {
  const label = monthFormatter.format(month.start);
  const range = `${rangeFormatter.format(month.start)} – ${rangeFormatter.format(month.end)}`;

  return (
    <div className="period-display">
      <div>
        <p className="eyebrow">{EYEBROW}</p>
        <h2>{label}</h2>
      </div>
      <dl>
        <DefinitionItem term={RANGE_TERM} description={range} />
        <DefinitionItem
          term={STATUS_TERM}
          description={statusLabel(isSameMonth(month, now))}
        />
      </dl>
    </div>
  );
}

export { PeriodDisplay };
