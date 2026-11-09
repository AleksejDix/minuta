import type { Temporal } from "temporal-polyfill";
import type { Unit } from "#src/types";

const DEFAULT_INCREMENT = 1;

/** How `round` picks the boundary: Temporal's rounding modes. */
type RoundingMode = NonNullable<
  Temporal.RoundingOptions<"day">["roundingMode"]
>;

/**
 * Options for `round`, named like Temporal's `round()` options.
 */
type RoundOptions<Name extends Unit = Unit> = Readonly<{
  /** How many units lie between boundaries. Default: 1. */
  roundingIncrement?: number | undefined;
  /** Temporal's rounding mode. Default: `"halfExpand"` (nearest, ties up). */
  roundingMode?: RoundingMode | undefined;
  /** The unit whose boundaries to round to */
  smallestUnit: Name;
}>;

/** A unit, or the options with its `smallestUnit`, like Temporal's `round()`. */
type RoundTo<Name extends Unit = Unit> = Name | RoundOptions<Name>;

/** The options with their defaults. */
type RoundRequest = Readonly<{ mode: RoundingMode; step: number; unit: Unit }>;

/*
 * Every value lies at or after its lower boundary, so Temporal's modes fold
 * into three: the lower boundary, the upper one, or the nearer one
 */
const DOWN: ReadonlySet<RoundingMode> = new Set(["floor", "trunc"]);
const UP: ReadonlySet<RoundingMode> = new Set(["ceil", "expand"]);
const TIES_DOWN: ReadonlySet<RoundingMode> = new Set([
  "halfFloor",
  "halfTrunc",
]);

/**
 * The options with their defaults; a unit alone, as Temporal's
 * `round("hour")` takes it.
 *
 * @param roundTo - A unit, or `smallestUnit` with its options
 * @returns The mode, the increment and the unit
 */
function requestOf(roundTo: RoundTo): RoundRequest {
  if (typeof roundTo === "string") {
    return { mode: "halfExpand", step: DEFAULT_INCREMENT, unit: roundTo };
  }
  return {
    mode: roundTo.roundingMode ?? "halfExpand",
    step: roundTo.roundingIncrement ?? DEFAULT_INCREMENT,
    unit: roundTo.smallestUnit,
  };
}

/**
 * Whether the mode always takes the lower boundary.
 *
 * @param mode - A rounding mode
 * @returns True for floor and trunc
 */
function roundsDown(mode: RoundingMode): boolean {
  return DOWN.has(mode);
}

/**
 * Whether the mode always takes the upper boundary.
 *
 * @param mode - A rounding mode
 * @returns True for ceil and expand
 */
function roundsUp(mode: RoundingMode): boolean {
  return UP.has(mode);
}

/**
 * Whether the mode takes the lower boundary on a tie.
 *
 * @param mode - A rounding mode
 * @returns True for halfFloor and halfTrunc
 */
function tiesDown(mode: RoundingMode): boolean {
  return TIES_DOWN.has(mode);
}

export { requestOf, roundsDown, roundsUp, tiesDown };
export type { RoundOptions, RoundTo, RoundingMode };
