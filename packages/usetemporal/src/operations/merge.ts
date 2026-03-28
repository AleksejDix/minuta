import type { Period, Adapter, AdapterUnit } from "../types";
import { derivePeriod } from "./period";
import { validatePeriod } from "./validate";

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

  for (const p of periods) {
    validatePeriod(p);
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
  if (periods.length === 7 && periods.every((p) => p.type === "day")) {
    let consecutive = true;
    for (let i = 1; i < sorted.length; i++) {
      const expected = adapter.add(sorted[i - 1].start, 1, "day");
      if (
        adapter.startOf(expected, "day").getTime() !== sorted[i].start.getTime()
      ) {
        consecutive = false;
        break;
      }
    }

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
  if (periods.length === 3 && periods.every((p) => p.type === "month")) {
    const firstYear = sorted[0].start.getFullYear();
    const firstMonth = sorted[0].start.getMonth();

    if (
      firstMonth % 3 === 0 &&
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
