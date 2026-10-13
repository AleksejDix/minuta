import { MinutaError, assertPositiveInteger, specFor } from "#src/units";
import type { Period, Unit, UnitSpec, Units } from "#src/types";

const DEFAULT_MAX_PERIODS = 100_000;
const DEFAULT_STEP = 1;
const ONE_MS = 1;

/**
 * Options for `divide` / `divideWith`.
 */
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

function earlierOf(left: Readonly<Date>, right: Readonly<Date>): Date {
  if (left > right) {
    return right;
  }
  return left;
}

// The end of the `step`-th unit from `start`, walking unit ends
function stepEnd(ctx: DivideContext, start: Readonly<Date>): Date {
  const { spec, step } = ctx;
  let end = spec.endOf(start);
  for (let unit = DEFAULT_STEP; unit < step; unit += DEFAULT_STEP) {
    end = spec.endOf(new Date(end.getTime() + ONE_MS));
  }
  return end;
}

/**
 * Build the chunk starting at `start`, the moment after the previous chunk,
 * clipped to the parent period. Starting where the last chunk ended keeps
 * chunks touching even when an engine starts a repeated hour twice.
 *
 * @param ctx - The division context
 * @param start - First moment of the chunk
 * @returns The chunk
 */
function buildChunk(ctx: DivideContext, start: Readonly<Date>): Period {
  const { period, spec, step } = ctx;
  const end = stepEnd(ctx, start);
  const isWhole =
    step === DEFAULT_STEP &&
    spec.startOf(start).getTime() === start.getTime() &&
    end <= period.end;
  let unit: Period["unit"] = "custom";
  if (isWhole) {
    ({ unit } = ctx);
  }
  return { end: earlierOf(end, period.end), start: new Date(start), unit };
}

function assertWithinLimit(generated: number, maxPeriods: number): void {
  if (generated > maxPeriods) {
    throw new RangeError(
      `${MinutaError.TooManyPeriods}: divideWith() generated over ${maxPeriods} periods. ` +
        "Use a larger unit or step, a shorter period, or raise the maxPeriods option."
    );
  }
}

function collectChunks(ctx: DivideContext, maxPeriods: number): Period[] {
  const periods: Period[] = [];
  let current = new Date(ctx.period.start);

  while (current <= ctx.period.end) {
    const chunk = buildChunk(ctx, current);
    periods.push(chunk);
    current = new Date(chunk.end.getTime() + ONE_MS);
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
 * @throws {RangeError} `TOO_MANY_PERIODS` when more than `maxPeriods` chunks
 *   would be created, `INVALID_OPTION` for a `step` or `maxPeriods` that is not
 *   a positive whole number
 */
// oxlint-disable-next-line eslint/max-params -- Context-first core signature: (units, period, unit, options)
function divideWith(
  units: Units,
  period: Period,
  unit: Unit,
  options: DivideOptions = {}
): Period[] {
  const { maxPeriods = DEFAULT_MAX_PERIODS, step = DEFAULT_STEP } = options;
  assertPositiveInteger(step, "divideWith() step");
  assertPositiveInteger(maxPeriods, "divideWith() maxPeriods");
  return collectChunks(
    { period, spec: specFor(units, unit), step, unit },
    maxPeriods
  );
}

export { divideWith };
export type { DivideOptions };
