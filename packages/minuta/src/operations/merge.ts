import type { Period, AdapterUnit } from "../types";

/**
 * Merge multiple periods into a single period spanning
 * from the earliest start to the latest end.
 */
export function merge(periods: Period[], targetUnit?: AdapterUnit): Period {
  if (periods.length === 0) {
    throw new Error("merge() requires at least one period");
  }

  if (periods.length === 1) {
    if (targetUnit) return { ...periods[0], type: targetUnit };
    return periods[0];
  }

  let minStart = periods[0].start.getTime();
  let maxEnd = periods[0].end.getTime();

  for (let i = 1; i < periods.length; i++) {
    const s = periods[i].start.getTime();
    const e = periods[i].end.getTime();
    if (s < minStart) minStart = s;
    if (e > maxEnd) maxEnd = e;
  }

  return {
    start: new Date(minStart),
    end: new Date(maxEnd),
    type: targetUnit ?? "custom",
  };
}
