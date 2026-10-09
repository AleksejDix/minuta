import type { AllUnits, Unit, UnitSpec } from "#src/types";
import type { WeekOptions, WeekdayNumber } from "#src/weekday";
import { weekStartOf, weekendOf } from "#src/weekday";

const ONE = 1;

function runtimeTimeZone(): string {
  return new Intl.DateTimeFormat().resolvedOptions().timeZone;
}
const AT_END = 0;

/**
 * The direction from `from` to `to`: 1 forward (or equal), -1 backward.
 *
 * @param from - Start
 * @param to - End
 * @returns 1 or -1
 */
function directionOf(from: Readonly<Date>, to: Readonly<Date>): number {
  if (to < from) {
    return -ONE;
  }
  return ONE;
}

/**
 * `spec` with a `diff` that follows the contract exactly: the complete units
 * from `from` to `to`, truncated toward zero, as counted by the spec's own
 * `add`. The original `diff` only serves as the starting estimate, so date
 * libraries that count boundaries or round differently all agree.
 *
 * @param spec - A unit spec whose `diff` is close to the complete count
 * @returns The spec with the exact `diff`
 */
function withCompleteDiff(spec: UnitSpec): UnitSpec {
  return {
    add: spec.add,
    diff: (from, to) => {
      const { add } = spec;
      const end = to.getTime();
      const sign = directionOf(from, to);
      // Step back while past `to`, then forward while the next unit still fits
      let count = spec.diff(from, to);
      while (sign * (add(from, count).getTime() - end) > AT_END) {
        count -= sign;
      }
      while (sign * (add(from, count + sign).getTime() - end) <= AT_END) {
        count += sign;
      }
      return count;
    },
    endOf: spec.endOf,
    startOf: spec.startOf,
  };
}

/**
 * Build an adapter's units: the time zone, and the week start and weekend
 * from `options`, all carried on the result, and
 * every spec with an exact `diff` (see `withCompleteDiff`).
 *
 * @param options - The adapter's week options
 * @param specsFor - One spec per unit, given the week start
 * @param timeZone - The zone the specs compute in, default the runtime's
 * @returns The adapter's units
 */
function adapterUnits(
  options: WeekOptions,
  specsFor: (weekStartsOn: WeekdayNumber) => Readonly<Record<Unit, UnitSpec>>,
  timeZone: string = runtimeTimeZone()
): AllUnits {
  const weekStartsOn = weekStartOf(options);
  const entries = Object.entries(specsFor(weekStartsOn)).map(
    ([unit, spec]: readonly [string, UnitSpec]) => [
      unit,
      withCompleteDiff(spec),
    ]
  );
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- Object.fromEntries returns any; the keys are the units of specsFor
  const specs = Object.fromEntries(entries) as Readonly<Record<Unit, UnitSpec>>;
  return Object.assign(specs, {
    timeZone,
    weekStartsOn,
    weekend: weekendOf(options),
  });
}

export { adapterUnits };
