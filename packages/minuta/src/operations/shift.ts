import type { Period, Unit, UnitSpec, Units } from "#src/types";
import { endFrom, specFor, startFrom } from "#src/units";
import { move } from "./move";
import { periodWith } from "./period";

const NO_STEPS = 0;
const ONE = 1;
const INCLUSIVE_END_MS = 1;

/*
 * Units of a fixed length: a step is plain arithmetic and never lands on a
 * gap. Not hours: Lord Howe moves its clocks by 30 minutes.
 */
const FIXED_LENGTH: ReadonlySet<string> = new Set(["minute", "second"]);

// The period starting right after `period`, or ending right before it
function neighbour(spec: UnitSpec, period: Period, forward: boolean): Period {
  if (forward) {
    const after = new Date(period.end.getTime() + INCLUSIVE_END_MS);
    return { end: endFrom(spec, after), start: after, unit: period.unit };
  }
  const before = new Date(period.start.getTime() - INCLUSIVE_END_MS);
  return { end: before, start: startFrom(spec, before), unit: period.unit };
}

/**
 * Step a period of a calendar unit one neighbour at a time: to the period
 * starting right after its end, or ending right before its start. Never asks
 * the engine for a local time, so a day the zone skipped (Samoa, Dec 30
 * 2011) or a missing hour cannot make a step stall or jump back, and an
 * engine that starts a repeated hour twice cannot make two steps overlap.
 *
 * @param units - Available unit specs
 * @param walk - The period, its calendar unit and how many steps
 * @returns The period that many places away
 */
function stepped(
  units: Units,
  walk: Readonly<{ period: Period; steps: number; unit: Unit }>
): Period {
  const { steps, unit } = walk;
  const spec = specFor(units, unit);
  let moved = periodWith(units, walk.period.start, unit);
  for (let step = NO_STEPS; step < Math.abs(steps); step += ONE) {
    moved = neighbour(spec, moved, steps > NO_STEPS);
  }
  return moved;
}

/**
 * Move a period by `steps` of its own unit: the period that many places
 * after (or before) it, so shifting by n is n times `next`. A custom period
 * moves by its own length.
 *
 * @example
 * shiftWith(units, march, 2)  // May
 * shiftWith(units, march, -1) // February
 *
 * @param units - Available unit specs
 * @param period - Period to move
 * @param steps - How many periods to move; negative moves back
 * @returns The moved period, or the same period for 0 steps
 */
function shiftWith(units: Units, period: Period, steps: number): Period {
  if (steps === NO_STEPS) {
    return period;
  }
  if (period.unit === "custom") {
    const length =
      period.end.getTime() - period.start.getTime() + INCLUSIVE_END_MS;
    return move(period, new Date(period.start.getTime() + length * steps));
  }
  if (FIXED_LENGTH.has(period.unit)) {
    const spec = specFor(units, period.unit);
    return periodWith(units, spec.add(period.start, steps), period.unit);
  }
  return stepped(units, { period, steps, unit: period.unit });
}

/**
 * The next period of the same unit.
 *
 * @example
 * nextWith(nativeUnits(), periodWith(nativeUnits(), new Date(2026, 2, 15), "month")); // April 2026
 *
 * @param units - Available unit specs
 * @param period - Current period
 * @returns The following period
 */
function nextWith(units: Units, period: Period): Period {
  return shiftWith(units, period, ONE);
}

/**
 * The previous period of the same unit.
 *
 * @example
 * previousWith(nativeUnits(), periodWith(nativeUnits(), new Date(2026, 2, 15), "month")); // February 2026
 *
 * @param units - Available unit specs
 * @param period - Current period
 * @returns The preceding period
 */
function previousWith(units: Units, period: Period): Period {
  return shiftWith(units, period, -ONE);
}

export { nextWith, previousWith, shiftWith };
