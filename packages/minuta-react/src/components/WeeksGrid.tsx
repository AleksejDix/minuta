import type { JSX } from "react";
import type { MinutaBuilder } from "#src/types";
import type { ReadonlyPeriod } from "minuta";
import { WeekRow } from "./WeekRow";
import { useMemo } from "react";

type WeekWithDays = Readonly<{
  days: readonly ReadonlyPeriod[];
  period: ReadonlyPeriod;
}>;

type WeeksGridProps = Readonly<{
  minuta: MinutaBuilder;
  month: ReadonlyPeriod;
  onSelectDate: ((date: Readonly<Date>) => void) | undefined;
}>;

function buildWeeks(
  minuta: MinutaBuilder,
  month: ReadonlyPeriod
): WeekWithDays[] {
  // Divide() clips the first and last week to the month; expand them to full
  // Weeks so day 1 lands in its weekday column (outside days render dimmed)
  return minuta.divide(month, "week").map((clipped: ReadonlyPeriod) => {
    const week = minuta.derivePeriod(clipped.start, "week");
    return { days: minuta.divide(week, "day"), period: week };
  });
}

function WeeksGrid({
  minuta,
  month,
  onSelectDate,
}: WeeksGridProps): JSX.Element {
  const weeks = useMemo(() => buildWeeks(minuta, month), [minuta, month]);

  return (
    <div className="weeks-grid">
      {weeks.map((week) => (
        <WeekRow
          key={week.period.start.toISOString()}
          days={week.days}
          minuta={minuta}
          month={month}
          onSelectDate={onSelectDate}
        />
      ))}
    </div>
  );
}

export { WeeksGrid };
