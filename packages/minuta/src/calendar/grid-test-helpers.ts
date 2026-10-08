import type { Period } from "#src/types";

const LAST_INDEX = -1;
const MS_PER_DAY = 86_400_000;

function firstOf(periods: readonly Period[]): Period {
  const [first] = periods;
  if (first === undefined) {
    throw new Error("Expected at least one period");
  }
  return first;
}

function lastOf(periods: readonly Period[]): Period {
  const last = periods.at(LAST_INDEX);
  if (last === undefined) {
    throw new Error("Expected at least one period");
  }
  return last;
}

function spanOf(periods: readonly Period[]): Period {
  return {
    end: lastOf(periods).end,
    start: firstOf(periods).start,
    unit: "custom",
  };
}

function spanDays(periods: readonly Period[]): number {
  const span = spanOf(periods);
  return Math.round((span.end.getTime() - span.start.getTime()) / MS_PER_DAY);
}

export { firstOf, lastOf, spanDays, spanOf };
