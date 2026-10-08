import { DayCell } from "./DayCell";
import type { JSX } from "react";
import type { MinutaBuilder } from "#src/types";
import type { ReadonlyPeriod } from "minuta";

type WeekRowProps = Readonly<{
  days: readonly ReadonlyPeriod[];
  minuta: MinutaBuilder;
  month: ReadonlyPeriod;
  onSelectDate: ((date: Readonly<Date>) => void) | undefined;
}>;

function WeekRow({
  days,
  minuta,
  month,
  onSelectDate,
}: WeekRowProps): JSX.Element {
  return (
    <div className="week-row">
      {days.map((day) => (
        <DayCell
          key={day.start.toISOString()}
          day={day}
          minuta={minuta}
          month={month}
          onSelectDate={onSelectDate}
        />
      ))}
    </div>
  );
}

export { WeekRow };
