import type {
  DatePeriod,
  DateSpec,
  DateUnit,
  Period,
  PlainDate,
  TimePeriod,
  TimeSpec,
  Unit,
  Units,
  ZonedDateTime,
} from "#src/types";
import {
  MinutaError,
  assertPositiveInteger,
  nextStart,
  specFor,
  timeSpecFor,
  timeZoneOf,
} from "#src/units";
import { compare, isDatePeriod, zonedPeriod } from "#src/values";

const DEFAULT_MAX_PERIODS = 100_000;
const DEFAULT_STEP = 1;
const EQUAL = 0;

/**
 * Options for `divide` / `divideWith`.
 */
type DivideOptions = Readonly<{
  /** Maximum number of periods before throwing. Default: 100,000. */
  maxPeriods?: number | undefined;
  /** How many units each chunk spans. Default: 1. */
  step?: number | undefined;
}>;

/**
 * The chunks a division makes: date periods when a date period is divided
 * by a date unit, time periods otherwise.
 */
type Chunks<
  Source extends Period,
  Name extends Unit,
> = Source extends DatePeriod
  ? Name extends DateUnit
    ? DatePeriod[]
    : TimePeriod[]
  : TimePeriod[];

type Value = PlainDate | ZonedDateTime;

/** A unit's boundaries: the start of the unit holding a value, and the next one. */
type Grid<Kind extends Value> = Readonly<{
  next: (start: Kind) => Kind;
  startOf: (date: Kind) => Kind;
}>;

type Walk<Kind extends Value> = Readonly<{
  end: Kind;
  grid: Grid<Kind>;
  maxPeriods: number;
  start: Kind;
  step: number;
  unit: Unit;
}>;

type Chunk<Kind extends Value> = Readonly<{
  end: Kind;
  start: Kind;
  unit: Unit | "custom";
}>;

type Division = Readonly<{
  maxPeriods: number;
  period: Period;
  step: number;
  unit: Unit;
}>;

function earlierOf<Kind extends Value>(left: Kind, right: Kind): Kind {
  if (compare(left, right) > EQUAL) {
    return right;
  }
  return left;
}

function assertWithinLimit(generated: number, maxPeriods: number): void {
  if (generated > maxPeriods) {
    throw new RangeError(
      `${MinutaError.TooManyPeriods}: divide() generated over ${maxPeriods} periods. ` +
        "Use a larger unit or step, a shorter period, or raise the maxPeriods option."
    );
  }
}

/**
 * The chunk starting at `current`: up to the `step`-th unit boundary after
 * it, clipped to the walk's end, labelled with the unit only when it is
 * exactly one whole unit.
 *
 * @param walk - The division
 * @param current - Where the chunk starts
 * @returns The chunk
 */
function chunkAt<Kind extends Value>(
  walk: Walk<Kind>,
  current: Kind
): Chunk<Kind> {
  const { end, grid, step } = walk;
  const unitStart = grid.startOf(current);
  let next = grid.next(unitStart);
  for (let unit = DEFAULT_STEP; unit < step; unit += DEFAULT_STEP) {
    next = grid.next(next);
  }
  const isWhole =
    step === DEFAULT_STEP &&
    compare(unitStart, current) === EQUAL &&
    compare(next, end) <= EQUAL;
  if (isWhole) {
    return { end: next, start: current, unit: walk.unit };
  }
  return { end: earlierOf(next, end), start: current, unit: "custom" };
}

/**
 * Walk from the start to the end one chunk at a time, each starting where
 * the last one ended.
 *
 * @param walk - The division
 * @returns The chunks
 */
function chunksOf<Kind extends Value>(walk: Walk<Kind>): Chunk<Kind>[] {
  const chunks: Chunk<Kind>[] = [];
  let current = walk.start;
  while (compare(current, walk.end) < EQUAL) {
    const chunk = chunkAt(walk, current);
    chunks.push(chunk);
    current = chunk.end;
    assertWithinLimit(chunks.length, walk.maxPeriods);
  }
  return chunks;
}

// The date grid of a date unit
function dateGrid(spec: DateSpec): Grid<PlainDate> {
  return {
    next: (start) => spec.add(start, DEFAULT_STEP),
    startOf: spec.startOf,
  };
}

// The grid of any unit on moments
function timeGrid(spec: TimeSpec): Grid<ZonedDateTime> {
  return { next: (start) => nextStart(spec, start), startOf: spec.startOf };
}

// The period as moments: a date period's days in the units' zone
function asMoments(units: Units, period: Period): TimePeriod {
  if (isDatePeriod(period)) {
    return zonedPeriod(period, timeZoneOf(units));
  }
  return period;
}

function divided(
  units: Units,
  division: Division
): Chunk<PlainDate>[] | Chunk<ZonedDateTime>[] {
  const { maxPeriods, period, step, unit } = division;
  const spec: DateSpec | TimeSpec = specFor(units, unit);
  if (isDatePeriod(period) && spec.kind === "date") {
    const { end, start } = period;
    const grid = dateGrid(spec);
    return chunksOf({ end, grid, maxPeriods, start, step, unit });
  }
  const { end, start } = asMoments(units, period);
  const grid = timeGrid(timeSpecFor(units, unit));
  return chunksOf({ end, grid, maxPeriods, start, step, unit });
}

/**
 * Divide a period into chunks of `unit`, clipped to the period. A date
 * period divided by a date unit gives date periods; divided by a time unit
 * (a day into hours), its days become moments in the units' time zone, so a
 * day the clocks skip has no hours at all.
 *
 * @example
 * divideWith(units, march, "day")                 // 31 day periods
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
function divideWith<Source extends Period, Name extends Unit>(
  units: Units,
  period: Source,
  unit: Name,
  options: DivideOptions = {}
): Chunks<Source, Name> {
  const { maxPeriods = DEFAULT_MAX_PERIODS, step = DEFAULT_STEP } = options;
  assertPositiveInteger(step, "divide() step");
  assertPositiveInteger(maxPeriods, "divide() maxPeriods");
  const chunks = divided(units, { maxPeriods, period, step, unit });
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- A date period divided by a date unit gives date periods, every other division time periods
  return chunks as Chunks<Source, Name>;
}

export { divideWith };
export type { Chunks, DivideOptions };
