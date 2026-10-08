import type { JSX } from "react";

type WeekdayRowProps = Readonly<{
  labels: readonly string[];
}>;

function WeekdayRow({ labels }: WeekdayRowProps): JSX.Element {
  return (
    <div className="weekday-grid">
      {labels.map((weekday) => (
        <span key={weekday}>{weekday}</span>
      ))}
    </div>
  );
}

export { WeekdayRow };
