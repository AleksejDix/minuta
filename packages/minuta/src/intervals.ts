/**
 * Editing and combining periods: the gap between two periods, their overlap
 * (`clamp`), merging, splitting, resizing, moving, and snapping dates to
 * unit boundaries. `intervals(units)` binds the unit-aware ones to your
 * units.
 *
 * @example
 * import { createUnits } from "@aleksejdix/minuta/core";
 * import { intervals } from "@aleksejdix/minuta/intervals";
 *
 * const edit = intervals(createUnits());
 * edit.snap(Temporal.Now.zonedDateTimeISO(), "minute", { step: 15 });
 *
 * @module minuta/intervals
 */
import type {
  DateUnit,
  Period,
  PlainDate,
  Unit,
  Units,
  ZonedDateTime,
} from "#src/types";
import {
  clamp,
  gap,
  mergeWith,
  move,
  resize,
  split,
} from "#src/operations/index";
import type { SnapOptions } from "#src/operations/index";
import { snapAny } from "#src/operations/snap";

/** `snapWith` once bound: a date snaps to dates, a moment to moments. */
type Snap = {
  (value: PlainDate, unit: DateUnit, options?: SnapOptions): PlainDate;
  (value: ZonedDateTime, unit: Unit, options?: SnapOptions): ZonedDateTime;
};

/**
 * The interval functions, the unit-aware ones bound to one set of units.
 */
type Intervals = Readonly<{
  clamp: typeof clamp;
  gap: typeof gap;
  merge: <Source extends Period>(
    periods: readonly Source[],
    unit?: Unit
  ) => Source | undefined;
  move: typeof move;
  resize: typeof resize;
  snap: Snap;
  split: typeof split;
}>;

/**
 * Bind the interval functions to `units`: `merge(periods)` and
 * `snap(value, unit)` instead of `mergeWith(units, …)` and
 * `snapWith(units, …)`. The unit-free ones come along unchanged.
 *
 * @example
 * const edit = intervals(createUnits());
 * edit.snap(Temporal.ZonedDateTime.from("2026-03-15T10:37[Europe/Zurich]"), "minute", { step: 15 }); // 10:30
 * edit.merge(days, "month"); // one period, if the days touch
 *
 * @param units - Unit specs to bind
 * @returns The interval functions without the `units` parameter
 */
function intervals(units: Units): Intervals {
  function snap(
    value: PlainDate,
    unit: DateUnit,
    options?: SnapOptions
  ): PlainDate;
  function snap(
    value: ZonedDateTime,
    unit: Unit,
    options?: SnapOptions
  ): ZonedDateTime;
  /**
   * `snapWith` bound to the units.
   *
   * @param value - The date or moment to snap
   * @param unit - The unit whose boundaries to snap to
   * @param options - `step` and `mode`
   * @returns The boundary, of the value's kind
   */
  function snap(
    value: PlainDate | ZonedDateTime,
    unit: Unit,
    options?: SnapOptions
  ): PlainDate | ZonedDateTime {
    return snapAny(units, value, unit, options);
  }
  return {
    clamp,
    gap,
    merge: (periods, unit) => mergeWith(units, periods, unit),
    move,
    resize,
    snap,
    split,
  };
}

export { intervals };
export {
  clamp,
  gap,
  mergeWith,
  move,
  resize,
  snapWith,
  split,
} from "#src/operations/index";
export type { Intervals, Snap };
export type { SnapMode, SnapOptions } from "#src/operations/index";
