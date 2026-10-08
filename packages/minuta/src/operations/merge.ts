import type { AdapterUnit, Period, ReadonlyPeriod } from "#src/types";

const SINGLE_PERIOD = 1;

function withType(period: ReadonlyPeriod, type: AdapterUnit): Period {
  const retyped: Period = { end: period.end, start: period.start, type };
  return Object.assign(retyped, period, { type });
}

function earliestStart(
  first: ReadonlyPeriod,
  periods: readonly ReadonlyPeriod[]
): number {
  let minStart = first.start.getTime();
  for (const period of periods) {
    const time = period.start.getTime();
    if (time < minStart) {
      minStart = time;
    }
  }
  return minStart;
}

function latestEnd(
  first: ReadonlyPeriod,
  periods: readonly ReadonlyPeriod[]
): number {
  let maxEnd = first.end.getTime();
  for (const period of periods) {
    const time = period.end.getTime();
    if (time > maxEnd) {
      maxEnd = time;
    }
  }
  return maxEnd;
}

/**
 * Merge multiple periods into a single period spanning
 * from the earliest start to the latest end.
 *
 * @param periods - The periods to merge (at least one)
 * @param targetUnit - Optional unit type for the merged period
 * @returns The merged period
 */
function merge(
  periods: readonly ReadonlyPeriod[],
  targetUnit?: AdapterUnit
): Period {
  const [first] = periods;
  if (first === undefined) {
    throw new Error("merge() requires at least one period");
  }

  if (periods.length === SINGLE_PERIOD) {
    if (targetUnit) {
      return withType(first, targetUnit);
    }
    return first;
  }

  return {
    end: new Date(latestEnd(first, periods)),
    start: new Date(earliestStart(first, periods)),
    type: targetUnit ?? "custom",
  };
}

export { merge };
