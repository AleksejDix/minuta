/**
 * Editing and combining periods, as a plugin: the gap between two periods,
 * their overlap (`clamp`), merging, splitting, resizing, moving, and
 * snapping dates to unit boundaries.
 *
 * @example
 * import { withUnits } from "@aleksejdix/minuta/core";
 * import { intervals } from "@aleksejdix/minuta/intervals";
 * import { temporalUnits } from "@aleksejdix/minuta/temporal";
 *
 * const time = withUnits(temporalUnits(), { plugins: [intervals] });
 * time.merge(time.divide(time.period(Temporal.Now.plainDateISO(), "month"), "day"), "month");
 * time.snap(Temporal.Now.zonedDateTimeISO(), "minute", { step: 15 });
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
  snapWith,
  split,
} from "#src/operations/index";
import type { BoundAs } from "#src/bind";
import type { SnapOptions } from "#src/operations/index";
import { boundAs } from "#src/bind";

/**
 * A function that takes no units, made to take them first like every
 * plugin function, so `withUnits` can bind it. Bound, it has exactly the
 * function's own signature, overloads and type parameters included.
 *
 * @param operation - A unit-free function
 * @returns The same function with a leading, ignored `units` parameter
 */
function ignoringUnits<
  // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- The constraint matches any function; never[] must stay spreadable
  Operation extends (...args: never[]) => unknown,
>(operation: Operation): IgnoringUnits<Operation> {
  /**
   * The operation, called without the units.
   *
   * @param _units - Ignored
   * @param args - The operation's arguments
   * @returns What the operation returns
   */
  function withoutUnits(
    _units: Units,
    // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- A generic tuple cannot be proven read-only; Readonly<> is applied
    ...args: Readonly<Parameters<Operation>>
  ): ReturnType<Operation> {
    // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Calling the operation returns its own return type
    return operation(...args) as ReturnType<Operation>;
  }
  return boundAs<Operation>()(withoutUnits);
}

/** A unit-free function as a plugin function: units first, ignored. */
type IgnoringUnits<Operation extends (...args: readonly never[]) => unknown> =
  ((
    units: Units,
    // oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- A generic tuple cannot be proven read-only; Readonly<> is applied
    ...args: Readonly<Parameters<Operation>>
  ) => ReturnType<Operation>) &
    BoundAs<Operation>;

/** `snapWith` once bound: a date snaps to dates, a moment to moments. */
type SnapBound = {
  (value: PlainDate, unit: DateUnit, options?: SnapOptions): PlainDate;
  (value: ZonedDateTime, unit: Unit, options?: SnapOptions): ZonedDateTime;
};

/** `mergeWith` once bound: periods of one kind merge into that kind. */
type MergeBound = <Source extends Period>(
  periods: readonly Source[],
  unit?: Unit
) => Source | undefined;

/**
 * The intervals plugin: pass it to `withUnits(units, { plugins: [intervals] })`
 * or to `bind(units, intervals)`.
 */
const intervals: Readonly<{
  clamp: IgnoringUnits<typeof clamp>;
  gap: IgnoringUnits<typeof gap>;
  merge: typeof mergeWith & BoundAs<MergeBound>;
  move: IgnoringUnits<typeof move>;
  resize: IgnoringUnits<typeof resize>;
  snap: typeof snapWith & BoundAs<SnapBound>;
  split: IgnoringUnits<typeof split>;
}> = {
  clamp: ignoringUnits(clamp),
  gap: ignoringUnits(gap),
  merge: boundAs<MergeBound>()(mergeWith),
  move: ignoringUnits(move),
  resize: ignoringUnits(resize),
  snap: boundAs<SnapBound>()(snapWith),
  split: ignoringUnits(split),
};

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
export type { SnapMode, SnapOptions } from "#src/operations/index";
