import type { Adapter, AdapterUnit, Period, ReadonlyPeriod } from "#src/types";

const DEFAULT_MAX_PERIODS = 100_000;
const DEFAULT_STEP = 1;
const ONE_MS = 1;
const STALL_STEP_FACTOR = 2;

type DivideOptions = {
  /** Maximum number of periods before throwing. Default: 100,000. */
  maxPeriods?: number;
};

type DivideContext = Readonly<{
  adapter: Readonly<Adapter>;
  period: ReadonlyPeriod;
  step: number;
  unit: AdapterUnit;
}>;

function resolveStep(count: number | Readonly<DivideOptions>): number {
  if (typeof count === "object") {
    return DEFAULT_STEP;
  }
  return count;
}

function resolveMaxPeriods(
  count: number | Readonly<DivideOptions>,
  options: Readonly<DivideOptions>
): number {
  if (typeof count === "object") {
    return count.maxPeriods ?? DEFAULT_MAX_PERIODS;
  }
  return options.maxPeriods ?? DEFAULT_MAX_PERIODS;
}

function laterOf(left: Readonly<Date>, right: Readonly<Date>): Date {
  if (left < right) {
    return right;
  }
  return left;
}

function earlierOf(left: Readonly<Date>, right: Readonly<Date>): Date {
  if (left > right) {
    return right;
  }
  return left;
}

function chunkType(ctx: DivideContext): Period["type"] {
  if (ctx.step === DEFAULT_STEP) {
    return ctx.unit;
  }
  return "custom";
}

/**
 * Build the chunk starting at `start`, clipped to the parent period.
 *
 * @param ctx - The division context
 * @param start - Start of the unit-aligned chunk
 * @returns The clipped chunk, or undefined when it does not overlap the parent
 */
function buildChunk(
  ctx: DivideContext,
  start: Readonly<Date>
): Period | undefined {
  const { adapter, period, step, unit } = ctx;
  const end = new Date(adapter.add(start, step, unit).getTime() - ONE_MS);

  // Only include periods that overlap with the parent period
  if (end < period.start || start > period.end) {
    return undefined;
  }
  return {
    end: earlierOf(end, period.end),
    start: laterOf(start, period.start),
    type: chunkType(ctx),
  };
}

function nextCursor(
  ctx: DivideContext,
  start: Readonly<Date>,
  current: Readonly<Date>
): Date {
  const { adapter, step, unit } = ctx;
  const nextDate = adapter.add(start, step, unit);

  if (nextDate.getTime() <= current.getTime()) {
    return adapter.add(start, step * STALL_STEP_FACTOR, unit);
  }
  return nextDate;
}

function assertWithinLimit(generated: number, maxPeriods: number): void {
  if (generated > maxPeriods) {
    throw new Error(
      `divide() generated over ${maxPeriods} periods — use a larger unit, smaller parent period, or increase maxPeriods`
    );
  }
}

function collectChunks(ctx: DivideContext, maxPeriods: number): Period[] {
  const periods: Period[] = [];
  let current = new Date(ctx.period.start);

  while (current <= ctx.period.end) {
    const start = ctx.adapter.startOf(current, ctx.unit);
    const chunk = buildChunk(ctx, start);
    if (chunk !== undefined) {
      periods.push(chunk);
    }

    // Move to next chunk
    current = nextCursor(ctx, start, current);

    assertWithinLimit(periods.length, maxPeriods);
  }

  return periods;
}

/**
 * Divide a period into smaller units.
 *
 * @param adapter - The date adapter
 * @param period - The period to divide
 * @param unit - The unit to divide by
 * @param count - How many units per chunk (default: 1).
 *   divide(adapter, day, "minute", 15) → 15-minute intervals
 * @param options - Division options such as `maxPeriods`
 * @returns The chunks covering the period
 *
 * @example
 * divide(adapter, month, "day")         // 28-31 day periods
 * divide(adapter, hour, "minute", 15)   // 4 fifteen-minute periods
 * divide(adapter, day, "minute", 30)    // 48 thirty-minute periods
 */
// oxlint-disable-next-line eslint/max-params -- Public API signature (adapter, period, unit, count, options) must stay stable
function divide(
  adapter: Readonly<Adapter>,
  period: ReadonlyPeriod,
  unit: AdapterUnit,
  count: number | Readonly<DivideOptions> = DEFAULT_STEP,
  options: Readonly<DivideOptions> = {}
): Period[] {
  // Handle backward-compatible options-as-4th-arg
  const step = resolveStep(count);
  const maxPeriods = resolveMaxPeriods(count, options);

  return collectChunks({ adapter, period, step, unit }, maxPeriods);
}

export { divide };
export type { DivideOptions };
