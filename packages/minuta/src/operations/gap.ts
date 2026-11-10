import type { Period } from "#src/types";
import { compare } from "#src/values";
import { sameKind } from "./kinds";

const EQUAL = 0;

/**
 * The time between two periods: from where the earlier one ends to where
 * the later one starts. Order does not matter. For a date, pass its day:
 * `day(date)`.
 *
 * @example
 * gap(day(Temporal.PlainDate.from("2026-03-02")), day(Temporal.PlainDate.from("2026-03-05")));
 * // { start: 2026-03-03, end: 2026-03-05, unit: "custom" }: Mar 3 and 4
 * gap(day(Temporal.PlainDate.from("2026-03-02")), day(Temporal.PlainDate.from("2026-03-03"))); // undefined: they touch
 *
 * @param first - One period
 * @param second - The other one
 * @returns The custom period between them, or undefined when they touch or overlap
 */
function gap(first: Period, second: Period): Period | undefined {
  let [earlier, later] = sameKind(first, second);
  if (compare(later.start, earlier.start) < EQUAL) {
    [earlier, later] = [later, earlier];
  }
  if (compare(earlier.end, later.start) >= EQUAL) {
    return undefined;
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- sameKind() made both periods one kind, so the edges are too
  return { end: later.start, start: earlier.end, unit: "custom" } as Period;
}

export { gap };
