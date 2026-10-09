import type { Unit, UnitSpec, Units } from "#src/types";
import { assertValidDate, specFor } from "#src/units";
import { countUnits } from "./utils/count-units";

const DEFAULT_STEP = 1;
const ONE = 1;
const EPOCH = new Date("1970-01-01T00:00");

/** How `snap` / `snapWith` picks the boundary. */
type SnapMode = "ceil" | "floor" | "nearest";

/**
 * Options for `snap` / `snapWith`.
 */
type SnapOptions = Readonly<{
  /** `"floor"`, `"ceil"` or `"nearest"` (ties round up). Default: `"nearest"`. */
  mode?: SnapMode | undefined;
  /** How many units lie between boundaries. Default: 1. */
  step?: number | undefined;
}>;

// Steps count from the start of the enclosing unit, so they follow the clock
const ENCLOSING: Readonly<Partial<Record<Unit, Unit>>> = {
  day: "month",
  hour: "day",
  minute: "hour",
  month: "year",
  quarter: "year",
  second: "minute",
};

type Bounds = Readonly<{ floor: Readonly<Date>; next: Readonly<Date> }>;

type StepContext = Readonly<{
  date: Readonly<Date>;
  spec: UnitSpec;
  step: number;
  unit: Unit;
  units: Units;
}>;

/** Where steps are counted from, and where the last one ends at the latest. */
type Grid = Readonly<{ anchor: Readonly<Date>; limit?: Readonly<Date> }>;

function unitBounds(spec: UnitSpec, date: Readonly<Date>): Bounds {
  const floor = spec.startOf(date);
  return { floor, next: spec.add(floor, ONE) };
}

function gridOf(ctx: StepContext): Grid {
  const enclosing = ENCLOSING[ctx.unit];
  if (enclosing === undefined) {
    // No enclosing unit (week, year): count from 1970
    return { anchor: ctx.spec.startOf(EPOCH) };
  }
  const outer = specFor(ctx.units, enclosing);
  const anchor = outer.startOf(ctx.date);
  // The last step of a month or day ends where the next one begins
  return { anchor, limit: outer.add(anchor, ONE) };
}

function stepBounds(ctx: StepContext): Bounds {
  const { date, spec, step } = ctx;
  const { anchor, limit } = gridOf(ctx);
  const first = Math.floor(countUnits(spec, anchor, date) / step) * step;
  const next = spec.add(anchor, first + step);
  if (limit !== undefined && next > limit) {
    return { floor: spec.add(anchor, first), next: limit };
  }
  return { floor: spec.add(anchor, first), next };
}

function boundsOf(ctx: StepContext): Bounds {
  if (ctx.step === DEFAULT_STEP) {
    return unitBounds(ctx.spec, ctx.date);
  }
  return stepBounds(ctx);
}

function pick(date: Readonly<Date>, bounds: Bounds, mode: SnapMode): Date {
  const { floor, next } = bounds;
  const time = date.getTime();
  if (mode === "floor" || floor.getTime() === time) {
    return new Date(floor);
  }
  if (mode === "ceil" || time - floor.getTime() >= next.getTime() - time) {
    return new Date(next);
  }
  return new Date(floor);
}

/**
 * Snap a date to a boundary of `step` units: the unit's start, or every
 * `step`-th one counted from the start of the enclosing unit (minutes from
 * the hour, hours from the day, days from the month, months and quarters
 * from the year; weeks and years from 1970).
 *
 * @example
 * snapWith(units, new Date(2026, 2, 15, 10, 37), "minute", { step: 15 }); // 10:30
 * snapWith(units, new Date(2026, 2, 15, 10, 37), "day", { mode: "ceil" }); // Mar 16
 * snapWith(units, new Date(2026, 2, 18), "week", { mode: "floor" }); // the week's start
 *
 * @param units - Available unit specs
 * @param date - The date to snap
 * @param unit - The unit whose boundaries to snap to
 * @param options - `step` (units between boundaries) and `mode`
 * @returns The boundary; `date` itself when it is one
 */
// oxlint-disable-next-line eslint/max-params -- Context-first core signature: (units, date, unit, options)
function snapWith(
  units: Units,
  date: Readonly<Date>,
  unit: Unit,
  options: SnapOptions = {}
): Date {
  assertValidDate(date, "date");
  const { mode = "nearest", step = DEFAULT_STEP } = options;
  const spec = specFor(units, unit);
  return pick(date, boundsOf({ date, spec, step, unit, units }), mode);
}

export { snapWith };
export type { SnapMode, SnapOptions };
