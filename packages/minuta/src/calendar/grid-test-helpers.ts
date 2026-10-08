import type { ReadonlyPeriod } from "#src/types";

const LAST_INDEX = -1;
const MS_PER_DAY = 86_400_000;

function firstOf(periods: readonly ReadonlyPeriod[]): ReadonlyPeriod {
  const [first] = periods;
  if (first === undefined) {
    throw new Error("Expected at least one period");
  }
  return first;
}

function lastOf(periods: readonly ReadonlyPeriod[]): ReadonlyPeriod {
  const last = periods.at(LAST_INDEX);
  if (last === undefined) {
    throw new Error("Expected at least one period");
  }
  return last;
}

function spanOf(periods: readonly ReadonlyPeriod[]): ReadonlyPeriod {
  return {
    end: lastOf(periods).end,
    start: firstOf(periods).start,
    type: "custom",
  };
}

function spanDays(periods: readonly ReadonlyPeriod[]): number {
  const span = spanOf(periods);
  return Math.round((span.end.getTime() - span.start.getTime()) / MS_PER_DAY);
}

export { firstOf, lastOf, spanDays, spanOf };
