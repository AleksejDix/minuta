import type { UnitSpec } from "#src/types";

const ONE = 1;

/**
 * The number of whole units from `from` to `to`: the largest `count` with
 * `add(from, count) <= to`. Corrects `diff`, which may count calendar
 * boundaries rather than complete units.
 *
 * @example
 * countUnits(units.day, new Date(2026, 0, 5, 23), new Date(2026, 0, 6, 1)); // 0
 *
 * @param spec - The unit to count
 * @param from - Where counting starts
 * @param to - Where counting stops
 * @returns The whole units; negative when `to` is before `from`
 */
function countUnits(
  spec: UnitSpec,
  from: Readonly<Date>,
  to: Readonly<Date>
): number {
  const end = to.getTime();
  let count = spec.diff(from, to);
  while (spec.add(from, count).getTime() > end) {
    count -= ONE;
  }
  while (spec.add(from, count + ONE).getTime() <= end) {
    count += ONE;
  }
  return count;
}

export { countUnits };
