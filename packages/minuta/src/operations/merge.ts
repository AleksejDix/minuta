import type { Period, Unit, Units } from "#src/types";
import { specFor } from "#src/units";

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

// oxlint-disable-next-line eslint/max-params -- Context-first: (units, start, end, unit)
function isAligned(
  units: Units,
  start: Readonly<Date>,
  end: Readonly<Date>,
  unit: Unit
): boolean {
  const spec = specFor(units, unit);
  return (
    spec.startOf(start).getTime() === start.getTime() &&
    spec.endOf(start).getTime() === end.getTime()
  );
}

/**
 * Merge periods into one spanning the earliest start to the latest end. The
 * result keeps `unit` (by default the first period's unit) only when it is
 * exactly one period of that unit; otherwise its unit is `"custom"`.
 *
 * @example
 * mergeWith(units, [januaryFirstHalf, januarySecondHalf], "month"); // January, unit "month"
 * mergeWith(units, [january, march]); // Jan 1 – Mar 31, unit "custom"
 * mergeWith(units, []); // undefined
 *
 * @param units - Available unit specs
 * @param periods - The periods to merge
 * @param unit - The unit the merged period should have if it is aligned;
 *   defaults to the first period's unit
 * @returns The merged period, or undefined for an empty list
 */
function mergeWith(
  units: Units,
  periods: readonly Period[],
  unit?: Unit
): Period | undefined {
  const [first] = periods;
  if (first === undefined) {
    return undefined;
  }
  const start = new Date(earliestStart(first, periods));
  const end = new Date(latestEnd(first, periods));
  const target = unit ?? first.unit;
  if (target === "custom" || !isAligned(units, start, end, target)) {
    return { end, start, unit: "custom" };
  }
  return { end, start, unit: target };
}

export { mergeWith };
