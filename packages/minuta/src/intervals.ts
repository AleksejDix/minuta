/**
 * Editing and combining periods, as a plugin: the gap between two periods,
 * their overlap (`clamp`), merging, splitting, resizing, moving, and
 * snapping dates to unit boundaries.
 *
 * @example
 * import { withUnits } from "minuta/core";
 * import { intervals } from "minuta/intervals";
 * import { nativeUnits } from "minuta/native";
 *
 * const time = withUnits(nativeUnits(), { plugins: [intervals] });
 * time.merge(time.divide(time.period(new Date(), "month"), "day"), "month");
 * time.snap(new Date(), "minute", { step: 15 });
 *
 * @module minuta/intervals
 */
import {
  clamp,
  gap,
  mergeWith,
  move,
  resize,
  snapWith,
  split,
} from "#src/operations/index";
import type { Units } from "#src/types";

/**
 * A function that takes no units, made to take them first like every
 * plugin function, so `withUnits` can bind it.
 *
 * @param operation - A unit-free function
 * @returns The same function with a leading, ignored `units` parameter
 */
function ignoringUnits<Args extends readonly unknown[], Result>(
  operation: (...args: Args) => Result
): (units: Units, ...args: Args) => Result {
  return (_units, ...args) => operation(...args);
}

/**
 * The intervals plugin: pass it to `withUnits(units, { plugins: [intervals] })`
 * or to `bind(units, intervals)`.
 */
const intervals: Readonly<{
  clamp: (
    units: Units,
    ...args: Readonly<Parameters<typeof clamp>>
  ) => ReturnType<typeof clamp>;
  gap: (
    units: Units,
    ...args: Readonly<Parameters<typeof gap>>
  ) => ReturnType<typeof gap>;
  merge: typeof mergeWith;
  move: (
    units: Units,
    ...args: Readonly<Parameters<typeof move>>
  ) => ReturnType<typeof move>;
  resize: (
    units: Units,
    ...args: Readonly<Parameters<typeof resize>>
  ) => ReturnType<typeof resize>;
  snap: typeof snapWith;
  split: (
    units: Units,
    ...args: Readonly<Parameters<typeof split>>
  ) => ReturnType<typeof split>;
}> = {
  clamp: ignoringUnits(clamp),
  gap: ignoringUnits(gap),
  merge: mergeWith,
  move: ignoringUnits(move),
  resize: ignoringUnits(resize),
  snap: snapWith,
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
