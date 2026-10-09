import type { ComplianceContext, DateInput } from "./context";
import { describe, expect, it } from "vitest";
import type { Unit } from "#src/types";

const ONE = 1;

const UNITS: readonly Unit[] = [
  "year",
  "quarter",
  "month",
  "week",
  "day",
  "hour",
  "minute",
  "second",
];

// Month ends, a leap day, a year end and both European DST changes
const DATES: readonly DateInput[] = [
  { day: 31, hour: 10, minute: 0, month: 0, year: 2024 },
  { day: 29, hour: 23, minute: 30, month: 1, year: 2024 },
  { day: 31, hour: 1, minute: 15, month: 2, year: 2024 },
  { day: 31, hour: 23, minute: 0, month: 11, year: 2024 },
  { day: 1, hour: 1, minute: 0, month: 0, year: 2025 },
  { day: 30, hour: 12, minute: 0, month: 2, year: 2025 },
  { day: 26, hour: 2, minute: 30, month: 9, year: 2025 },
  { day: 15, hour: 0, minute: 0, month: 5, year: 2026 },
];

type Port = ComplianceContext["adapter"];

type Pair = Readonly<{ from: Readonly<Date>; to: Readonly<Date> }>;

/**
 * Whether `diff` gives the complete-unit distance between the pair:
 * `add(from, diff)` is reached without passing `to`, one more unit passes it.
 *
 * @param adapter - The units under test
 * @param unit - The unit to check
 * @param pair - Where the distance starts and ends
 * @returns Whether `diff` follows the contract
 */
function isCompleteCount(adapter: Port, unit: Unit, pair: Pair): boolean {
  const { from, to } = pair;
  const count = adapter.diff(from, to, unit);
  const reached = adapter.add(from, count, unit).getTime();
  const end = to.getTime();
  if (end >= from.getTime()) {
    return (
      reached <= end && adapter.add(from, count + ONE, unit).getTime() > end
    );
  }
  return reached >= end && adapter.add(from, count - ONE, unit).getTime() < end;
}

/**
 * Register the `diff` contract: complete units, truncated toward zero.
 * @param ctx - The compliance context
 */
function registerDiffContractTests(ctx: ComplianceContext): void {
  const { adapter, createDate } = ctx;
  const dates: readonly Readonly<Date>[] = DATES.map((input) =>
    createDate(input)
  );
  const pairs: readonly Pair[] = dates.flatMap((from) =>
    dates.map((to) => ({ from, to }))
  );
  describe(`${ctx.adapterName} Adapter Compliance`, () => {
    it.each(UNITS)(
      "diff counts complete %s units in both directions",
      { timeout: 5000 },
      (unit) => {
        expect.hasAssertions();
        const violations = pairs
          .filter((pair) => !isCompleteCount(adapter, unit, pair))
          .map(({ from, to }) => `${from.toISOString()} → ${to.toISOString()}`);
        expect(violations).toStrictEqual([]);
      }
    );
  });
}

export { registerDiffContractTests };
