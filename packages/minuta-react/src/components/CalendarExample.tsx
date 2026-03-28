import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import type { Period } from "@allystudio/usetemporal";
import { createNativeAdapter } from "@allystudio/usetemporal/native";
import { useTemporal } from "../useTemporal";
import { usePeriod } from "../usePeriod";
import type { TemporalBuilder } from "../types";

const WEEKDAY_ORDER: Record<0 | 1, string[]> = {
  0: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  1: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
};

const dayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

const rangeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

type WeekWithDays = { period: Period; days: Period[] };

/**
 * Batteries-included calendar that mirrors the React example app.
 * Ship it from the package so docs + sandboxes can import it directly.
 */
export function CalendarExample() {
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(1);

  // PATTERN: Memoize adapters so React recreates them when config changes.
  const adapter = useMemo(
    () => createNativeAdapter({ weekStartsOn }),
    [weekStartsOn]
  );

  const temporal = useTemporal({
    adapter,
    date: new Date(),
  });

  const month = usePeriod(temporal, "month");

  const weeks = useMemo<WeekWithDays[]>(
    () => buildWeeks(temporal, month),
    [temporal, month]
  );
  const weekdayLabels = WEEKDAY_ORDER[weekStartsOn];

  return (
    <section className="calendar-shell" data-testid="calendar-example">
      <header className="calendar-header">
        <div>
          <h1>useTemporal React Demo</h1>
          <p className="subheading">
            Derived periods, divide() pattern, and adapter reactivity in one
            hook.
          </p>
        </div>
        <WeekStartToggle
          weekStartsOn={weekStartsOn}
          onChange={setWeekStartsOn}
        />
      </header>

      <PeriodDisplay month={month} now={temporal.now} />

      <NavigationControls temporal={temporal} targetPeriod={month} />

      <div className="weekday-grid">
        {weekdayLabels.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>

      <div className="weeks-grid">
        {weeks.map((week) => (
          <div key={week.period.start.toISOString()} className="week-row">
            {week.days.map((day) => {
              const isOutside = !temporal.contains(month, day.date);
              const isToday = temporal.isSame(day, temporal.now, "day");
              return (
                <button
                  type="button"
                  key={day.start.toISOString()}
                  className={[
                    "day-cell",
                    isOutside ? "is-outside" : "",
                    isToday ? "is-today" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => temporal.go(day, 0)}
                  title={dayFormatter.format(day.date)}
                >
                  <span className="date-number">{day.date.getDate()}</span>
                  <span className="weekday-label">
                    {dayFormatter.format(day.date)}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}

function buildWeeks(temporal: TemporalBuilder, month: Period): WeekWithDays[] {
  return temporal.divide(month, "week").map((week) => ({
    period: week,
    days: temporal.divide(week, "day"),
  }));
}

function NavigationControls({
  temporal,
  targetPeriod,
}: {
  temporal: TemporalBuilder;
  targetPeriod: Period;
}) {
  return (
    <div className="toolbar-row">
      <button
        type="button"
        className="nav-button"
        onClick={() => temporal.previous(targetPeriod)}
      >
        ← Previous
      </button>
      <button
        type="button"
        className="nav-button"
        onClick={() => temporal.next(targetPeriod)}
      >
        Next →
      </button>
    </div>
  );
}

function PeriodDisplay({ month, now }: { month: Period; now: Period }) {
  const label = monthFormatter.format(month.date);
  const isCurrentMonth =
    month.date.getFullYear() === now.date.getFullYear() &&
    month.date.getMonth() === now.date.getMonth();

  return (
    <div className="period-display">
      <div>
        <p className="eyebrow">Browsing</p>
        <h2>{label}</h2>
      </div>
      <dl>
        <div>
          <dt>Range</dt>
          <dd>
            {rangeFormatter.format(month.start)} –{" "}
            {rangeFormatter.format(month.end)}
          </dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{isCurrentMonth ? "Current month" : "Historical view"}</dd>
        </div>
      </dl>
    </div>
  );
}

function WeekStartToggle({
  weekStartsOn,
  onChange,
}: {
  weekStartsOn: 0 | 1;
  onChange: Dispatch<SetStateAction<0 | 1>>;
}) {
  return (
    <div className="toolbar-section">
      <p className="toolbar-label">Week starts on</p>
      <div className="toggle-group">
        <button
          type="button"
          className={weekStartsOn === 0 ? "toggle is-active" : "toggle"}
          onClick={() => onChange(0)}
        >
          Sunday
        </button>
        <button
          type="button"
          className={weekStartsOn === 1 ? "toggle is-active" : "toggle"}
          onClick={() => onChange(1)}
        >
          Monday
        </button>
      </div>
    </div>
  );
}
