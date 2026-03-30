import type { Period, Adapter, AdapterUnit } from "../types";
import { derivePeriod } from "./period";

const DAYS_PER_WEEK = 7;
const MONTHS_PER_QUARTER = 3;

/**
 * Merge multiple periods into a single period
 */
export function merge(
  adapter: Adapter,
  periods: Period[],
  targetUnit?: AdapterUnit
): Period {
  if (periods.length === 0) {
    throw new Error("merge() requires at least one period");
  }

  if (periods.length === 1) {
    if (targetUnit && targetUnit !== periods[0].type) {
      return derivePeriod(adapter, periods[0].start, targetUnit);
    }
    return periods[0];
  }

  const sorted = [...periods].sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  const start = sorted[0].start;
  const end = sorted[sorted.length - 1].end;

  // Natural unit detection: if the merged periods form a recognized calendar
  // unit, promote the result instead of returning a custom period.

  // 7 consecutive days that align to week boundaries → week
  if (
    periods.length === DAYS_PER_WEEK &&
    periods.every((p) => p.type === "day")
  ) {
    const consecutive = sorted.every((p, i) => {
      if (i === 0) return true;
      const expected = adapter.startOf(
        adapter.add(sorted[i - 1].start, 1, "day"),
        "day"
      );
      return expected.getTime() === p.start.getTime();
    });

    if (consecutive) {
      const startOfWeek = adapter.startOf(sorted[0].start, "week");
      const endOfWeek = adapter.endOf(sorted[6].start, "week");

      if (
        start.getTime() === startOfWeek.getTime() &&
        end.getTime() === endOfWeek.getTime()
      ) {
        return derivePeriod(adapter, sorted[3].start, "week");
      }
    }
  }

  // 3 consecutive months starting at a quarter boundary (Jan/Apr/Jul/Oct) → quarter
  if (
    periods.length === MONTHS_PER_QUARTER &&
    periods.every((p) => p.type === "month")
  ) {
    const firstYear = sorted[0].start.getFullYear();
    const firstMonth = sorted[0].start.getMonth();

    if (
      firstMonth % MONTHS_PER_QUARTER === 0 &&
      sorted[1].start.getFullYear() === firstYear &&
      sorted[1].start.getMonth() === firstMonth + 1 &&
      sorted[2].start.getFullYear() === firstYear &&
      sorted[2].start.getMonth() === firstMonth + 2
    ) {
      return derivePeriod(adapter, sorted[1].start, "quarter");
    }
  }

  if (targetUnit) {
    return { start, end, type: targetUnit };
  }

  return { start, end, type: "custom" };
}
