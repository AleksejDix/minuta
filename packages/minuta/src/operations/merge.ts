import type { Period, Unit, Units } from "#src/types";
import { compare, isDatePeriod } from "#src/values";
import { earlierOf, laterOf } from "./edges";
import { periodWith } from "./period";

const EQUAL = 0;

// Whether `period` is exactly one period of `unit`, and of its kind
function isAligned(units: Units, period: Period, unit: Unit): boolean {
  const aligned = periodWith(units, period.start, unit);
  if (isDatePeriod(aligned) !== isDatePeriod(period)) {
    return false;
  }
  return (
    compare(aligned.start, period.start) === EQUAL &&
    compare(aligned.end, period.end) === EQUAL
  );
}

// The span from the earliest start to the latest end, unit "custom"
function spanOf<Source extends Period>(
  first: Source,
  periods: readonly Source[]
): Source {
  let { end, start } = first;
  for (const period of periods) {
    start = earlierOf(start, period.start);
    end = laterOf(end, period.end);
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Every period has the first one's kind, so the merged edges do too
  return { end, start, unit: "custom" } as Source;
}

/**
 * Merge periods of one kind into one spanning the earliest start to the
 * latest end. The result keeps `unit` (by default the first period's unit)
 * only when it is exactly one period of that unit; otherwise its unit is
 * `"custom"`.
 *
 * @example
 * mergeWith(units, [januaryFirstHalf, januarySecondHalf], "month"); // January, unit "month"
 * mergeWith(units, [january, march]); // Jan 1 – Apr 1, unit "custom"
 * mergeWith(units, []); // undefined
 *
 * @param units - Available unit specs
 * @param periods - The periods to merge, all dates or all moments
 * @param unit - The unit the merged period should have if it is aligned;
 *   defaults to the first period's unit
 * @returns The merged period, or undefined for an empty list
 */
function mergeWith<Source extends Period>(
  units: Units,
  periods: readonly Source[],
  unit?: Unit
): Source | undefined {
  const [first] = periods;
  if (first === undefined) {
    return undefined;
  }
  const merged = spanOf(first, periods);
  const target = unit ?? first.unit;
  if (target === "custom" || !isAligned(units, merged, target)) {
    return merged;
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- An aligned period of a unit has that unit's kind
  return { end: merged.end, start: merged.start, unit: target } as Source;
}

export { mergeWith };
