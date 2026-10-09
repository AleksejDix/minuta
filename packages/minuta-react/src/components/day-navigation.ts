import type { Minuta, Period, Unit } from "minuta/core";

/** The operations the keyboard navigation needs */
type Operations = Pick<
  Minuta,
  "contains" | "divide" | "period" | "same" | "shift"
>;

/** The parts of a keyboard event that pick the target day */
type DayKey = Readonly<{ key: string; shiftKey: boolean }>;

type Move = (operations: Operations, day: Period, shiftKey: boolean) => Period;

const FORWARD = 1;
const BACKWARD = -1;
const FIRST = 0;
const LAST = -1;

/**
 * The position of `part` among the parts of its unit in `parent`.
 *
 * @param operations - The bound operations
 * @param parent - The containing period
 * @param part - A period inside `parent`
 * @returns Its index, from 0
 */
function indexIn(
  operations: Operations,
  parent: Period,
  part: Readonly<{ period: Period; unit: Unit }>
): number {
  return operations
    .divide(parent, part.unit)
    .findIndex((candidate) =>
      operations.same(candidate, part.period, part.unit)
    );
}

/**
 * The part of `unit` at `index` in `parent`, clamped to its last part.
 *
 * @param operations - The bound operations
 * @param parent - The containing period
 * @param part - The unit and index of the part
 * @returns The part, e.g. the 30th of February is the 29th
 */
function partAt(
  operations: Operations,
  parent: Period,
  part: Readonly<{ index: number; unit: Unit }>
): Period {
  const parts = operations.divide(parent, part.unit);
  return parts.at(Math.min(part.index, parts.length + LAST)) ?? parent;
}

/**
 * Moves `part` by whole periods of `unit`, keeping its position inside them.
 *
 * @param operations - The bound operations
 * @param part - The period and unit to move
 * @param move - The containing unit and the steps to move it by
 * @returns The part at the same position, clamped, in the shifted period
 */
function shiftWithin(
  operations: Operations,
  part: Readonly<{ period: Period; unit: Unit }>,
  move: Readonly<{ steps: number; unit: Unit }>
): Period {
  const parent = operations.period(part.period.start, move.unit);
  return partAt(operations, operations.shift(parent, move.steps), {
    index: indexIn(operations, parent, part),
    unit: part.unit,
  });
}

/**
 * Moves a day by whole months or years, clamping to the target month.
 *
 * @param operations - The bound operations
 * @param day - The day to move
 * @param move - `"month"` or `"year"` and the steps
 * @returns The day with the same number, or the last of a shorter month
 */
function shiftDayBy(
  operations: Operations,
  day: Period,
  move: Readonly<{ steps: number; unit: "month" | "year" }>
): Period {
  const month = operations.period(day.start, "month");
  const target = shiftWithin(
    operations,
    { period: month, unit: "month" },
    { steps: move.steps, unit: move.unit }
  );
  return partAt(operations, target, {
    index: indexIn(operations, month, { period: day, unit: "day" }),
    unit: "day",
  });
}

function weekDay(operations: Operations, day: Period, index: number): Period {
  const week = operations.period(day.start, "week");
  return operations.divide(week, "day").at(index) ?? day;
}

function pageUnit(shiftKey: boolean): "month" | "year" {
  if (shiftKey) {
    return "year";
  }
  return "month";
}

const MOVES: ReadonlyMap<string, Move> = new Map<string, Move>([
  [
    "ArrowDown",
    (operations, day) =>
      shiftWithin(
        operations,
        { period: day, unit: "day" },
        { steps: FORWARD, unit: "week" }
      ),
  ],
  ["ArrowLeft", (operations, day) => operations.shift(day, BACKWARD)],
  ["ArrowRight", (operations, day) => operations.shift(day, FORWARD)],
  [
    "ArrowUp",
    (operations, day) =>
      shiftWithin(
        operations,
        { period: day, unit: "day" },
        { steps: BACKWARD, unit: "week" }
      ),
  ],
  ["End", (operations, day) => weekDay(operations, day, LAST)],
  ["Home", (operations, day) => weekDay(operations, day, FIRST)],
  [
    "PageDown",
    (operations, day, shiftKey) =>
      shiftDayBy(operations, day, { steps: FORWARD, unit: pageUnit(shiftKey) }),
  ],
  [
    "PageUp",
    (operations, day, shiftKey) =>
      shiftDayBy(operations, day, {
        steps: BACKWARD,
        unit: pageUnit(shiftKey),
      }),
  ],
]);

/**
 * The day a navigation key moves the focus to, following the APG date
 * picker grid: arrows by day and week, Home/End to the week's ends,
 * PageUp/PageDown by month, with Shift by year.
 *
 * @param operations - The bound operations
 * @param day - The focused day
 * @param event - The pressed key and whether Shift is held
 * @returns The target day, undefined for any other key
 */
function dayForKey(
  operations: Operations,
  day: Period,
  event: DayKey
): Period | undefined {
  const move = MOVES.get(event.key);
  if (move === undefined) {
    return undefined;
  }
  return move(operations, day, event.shiftKey);
}

/**
 * The one tabbable day of the browsed month: the first of `candidates`
 * inside it (e.g. focused, selected, today), else the month's first day.
 *
 * @param operations - The bound operations
 * @param browsing - The browsed month
 * @param candidates - Days in order of preference
 * @returns The tabbable day
 */
function activeDay(
  operations: Operations,
  browsing: Period,
  candidates: readonly (Period | undefined)[]
): Period {
  const inMonth = candidates.find(
    (candidate) =>
      candidate !== undefined && operations.contains(browsing, candidate.start)
  );
  return inMonth ?? operations.period(browsing.start, "day");
}

export { activeDay, dayForKey };
