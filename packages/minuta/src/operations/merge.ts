import type { Period, Unit } from "#src/types";

const SINGLE_PERIOD = 1;

function withUnit(period: Period, unit: Unit): Period {
  return { end: period.end, start: period.start, unit };
}

function earliestStart(first: Period, periods: readonly Period[]): number {
  let minStart = first.start.getTime();
  for (const period of periods) {
    const time = period.start.getTime();
    if (time < minStart) {
      minStart = time;
    }
  }
  return minStart;
}

function latestEnd(first: Period, periods: readonly Period[]): number {
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
 * @returns The merged period, or undefined for an empty list
 */
function merge(
  periods: readonly Period[],
  targetUnit?: Unit
): Period | undefined {
  const [first] = periods;
  if (first === undefined) {
    return undefined;
  }

  if (periods.length === SINGLE_PERIOD) {
    if (targetUnit) {
      return withUnit(first, targetUnit);
    }
    return first;
  }

  return {
    end: new Date(latestEnd(first, periods)),
    start: new Date(earliestStart(first, periods)),
    unit: targetUnit ?? "custom",
  };
}

export { merge };
