/**
 * Date engines: the same task needs different code in every date library;
 * with minuta only the import changes, and the result is the same.
 */
import { dayLabel, demoRoots, fillList, inputDate, part } from "./dom";
import type { Period } from "minuta";
import { dateFnsUnits } from "minuta/date-fns";
import { dayjsUnits } from "minuta/dayjs";
import { luxonUnits } from "minuta/luxon";
import { momentUnits } from "minuta/moment";
import { nativeUnits } from "minuta/native";
import { temporalUnits } from "minuta/temporal";
import { withUnits } from "minuta/core";

type Engine = Readonly<{
  /** The adapter function's name */
  adapter: string;
  /** Makes the engine's units */
  make: () => ReturnType<typeof nativeUnits>;
  /** The entry point the adapter comes from */
  module: string;
  /** How the weeks of a month look in that library, without minuta */
  without: string;
}>;

const ENGINES: ReadonlyMap<string, Engine> = new Map<string, Engine>([
  [
    "native",
    {
      adapter: "nativeUnits",
      make: () => nativeUnits(),
      module: "minuta/native",
      without: `const first = new Date(date.getFullYear(), date.getMonth(), 1);
const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
// …then find the Mondays by hand, walk 7 days at a time,
// and cut the first and last week to the month yourself`,
    },
  ],
  [
    "date-fns",
    {
      adapter: "dateFnsUnits",
      make: () => dateFnsUnits(),
      module: "minuta/date-fns",
      without: `eachWeekOfInterval(
  { start: startOfMonth(date), end: endOfMonth(date) },
  { weekStartsOn: 1 },
);
// → the Mondays only: no week ends, and the first one is
//   in the previous month, so cut each week by hand`,
    },
  ],
  [
    "luxon",
    {
      adapter: "luxonUnits",
      make: () => luxonUnits(),
      module: "minuta/luxon",
      without: `const month = DateTime.fromJSDate(date).startOf("month");
Interval.fromDateTimes(month, month.endOf("month"))
  .splitBy({ weeks: 1 });
// → 7-day pieces counted from the 1st, not Monday-to-Sunday weeks`,
    },
  ],
  [
    "dayjs",
    {
      adapter: "dayjsUnits",
      make: () => dayjsUnits(),
      module: "minuta/dayjs",
      without: `dayjs.extend(isoWeek);
let week = dayjs(date).startOf("month").startOf("isoWeek");
// …then loop with week.add(1, "week") until the month ends,
// and cut the first and last week yourself`,
    },
  ],
  [
    "moment",
    {
      adapter: "momentUnits",
      make: () => momentUnits(),
      module: "minuta/moment",
      without: `const week = moment(date).startOf("month").startOf("isoWeek");
// …then loop with week.add(1, "week") — which mutates week —
// and cut the first and last week yourself`,
    },
  ],
  [
    "temporal",
    {
      adapter: "temporalUnits",
      make: () => temporalUnits(),
      module: "minuta/temporal",
      without: `const first = Temporal.PlainDate.from(iso).with({ day: 1 });
const monday = first.subtract({ days: first.dayOfWeek - 1 });
// …then add({ weeks: 1 }) in a loop, and cut the weeks
// to the month yourself`,
    },
  ],
]);

function weeksWith(engine: Engine, date: Readonly<Date>): Period[] {
  const time = withUnits(engine.make());
  return time.divide(time.period(date, "month"), "week");
}

function sameWeeks(left: readonly Period[], right: readonly Period[]): boolean {
  return (
    left.length === right.length &&
    left.every((week, index) => {
      const other = right[index];
      return (
        other !== undefined &&
        week.start.getTime() === other.start.getTime() &&
        week.end.getTime() === other.end.getTime()
      );
    })
  );
}

function verdict(
  engine: Engine,
  date: Readonly<Date>,
  weeks: readonly Period[]
): string {
  const native = ENGINES.get("native");
  if (native === undefined || sameWeeks(weeks, weeksWith(native, date))) {
    return `✓ The same ${String(weeks.length)} weeks as with the built-in Date.`;
  }
  return `✗ ${engine.adapter} gave different weeks.`;
}

function solution(engine: Engine): string {
  return `import { ${engine.adapter} } from "${engine.module}";
import { withUnits } from "minuta/core";

const time = withUnits(${engine.adapter}());
time.divide(time.period(date, "month"), "week");`;
}

function show(root: HTMLElement): void {
  const engine = ENGINES.get(part(root, "engine", HTMLSelectElement).value);
  const date = inputDate(part(root, "date", HTMLInputElement)) ?? new Date();
  if (engine === undefined) {
    return;
  }
  const weeks = weeksWith(engine, date);
  part(root, "without", HTMLElement).textContent = engine.without;
  part(root, "with", HTMLElement).textContent = solution(engine);
  fillList(
    part(root, "weeks", HTMLElement),
    weeks.map(
      (week) => `${week.unit}: ${dayLabel(week.start)} – ${dayLabel(week.end)}`
    )
  );
  part(root, "verdict", HTMLElement).textContent = verdict(engine, date, weeks);
}

/**
 * Wire up every date-engines demo on the page.
 */
function mountEnginesDemos(): void {
  for (const root of demoRoots("engines")) {
    part(root, "engine", HTMLSelectElement).addEventListener("change", () => {
      show(root);
    });
    part(root, "date", HTMLInputElement).addEventListener("input", () => {
      show(root);
    });
    show(root);
  }
}

export { mountEnginesDemos };
