import type { Period, Unit, UnitSpec, Units } from "#src/types";
import { specFor } from "#src/units";

const DEFAULT_MAX_PERIODS = 100_000;
const DEFAULT_STEP = 1;
const ONE_MS = 1;
const STALL_STEP_FACTOR = 2;

type DivideOptions = Readonly<{
  /** Maximum number of periods before throwing. Default: 100,000. */
  maxPeriods?: number | undefined;
  /** How many units each chunk spans. Default: 1. */
  step?: number | undefined;
}>;

type DivideContext = Readonly<{
  period: Period;
  spec: UnitSpec;
  step: number;
  unit: Unit;
}>;

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

function chunkUnit(ctx: DivideContext): Period["unit"] {
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
  const { period, spec, step } = ctx;
  const end = new Date(spec.add(start, step).getTime() - ONE_MS);

  // Only include periods that overlap with the parent period
  if (end < period.start || start > period.end) {
    return undefined;
  }
  return {
    end: earlierOf(end, period.end),
    start: laterOf(start, period.start),
    unit: chunkUnit(ctx),
  };
}

function nextCursor(
  ctx: DivideContext,
  start: Readonly<Date>,
  current: Readonly<Date>
): Date {
  const { spec, step } = ctx;
  const nextDate = spec.add(start, step);

  if (nextDate.getTime() <= current.getTime()) {
    return spec.add(start, step * STALL_STEP_FACTOR);
  }
  return nextDate;
}

function assertWithinLimit(generated: number, maxPeriods: number): void {
  if (generated > maxPeriods) {
    throw new RangeError(
      `divideWith() generated over ${maxPeriods} periods — use a larger unit, smaller parent period, or increase maxPeriods`
    );
  }
}

function collectChunks(ctx: DivideContext, maxPeriods: number): Period[] {
  const periods: Period[] = [];
  let current = new Date(ctx.period.start);

  while (current <= ctx.period.end) {
    const start = ctx.spec.startOf(current);
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
 * Divide a period into chunks of `unit`, clipped to the period.
 *
 * @example
 * divideWith(units, month, "day")                 // 28-31 day periods
 * divideWith(units, hour, "minute", { step: 15 }) // 4 fifteen-minute periods
 *
 * @param units - Available unit specs
 * @param period - Period to divide
 * @param unit - Unit of the chunks
 * @param options - `step` (units per chunk) and `maxPeriods` (safety limit)
 * @returns The chunks covering the period
 * @throws {RangeError} When more than `maxPeriods` chunks would be created
 */
// oxlint-disable-next-line eslint/max-params -- Context-first core signature: (units, period, unit, options)
function divideWith(
  units: Units,
  period: Period,
  unit: Unit,
  options: DivideOptions = {}
): Period[] {
  const { maxPeriods = DEFAULT_MAX_PERIODS, step = DEFAULT_STEP } = options;
  return collectChunks(
    { period, spec: specFor(units, unit), step, unit },
    maxPeriods
  );
}

export { divideWith };
export type { DivideOptions };
