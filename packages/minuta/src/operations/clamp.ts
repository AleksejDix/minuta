import { earlierOf, laterOf } from "./edges";
import type { Period } from "#src/types";
import { compare } from "#src/values";
import { sameKind } from "./kinds";

const EQUAL = 0;

/**
 * Constrain a period to fit within bounds: the time the two share.
 *
 * Returns undefined when they share no time, also when they only touch.
 * Next to a time period, a date period becomes moments in that period's
 * zone.
 *
 * @example
 * const selection = range(Temporal.PlainDate.from("2026-01-05"), Temporal.PlainDate.from("2026-01-25"));
 * const allowed = range(Temporal.PlainDate.from("2026-01-10"), Temporal.PlainDate.from("2026-01-20"));
 * clamp(selection, allowed);
 * // → { start: 2026-01-10, end: 2026-01-20, unit: "custom" }
 *
 * @param period - The period to constrain
 * @param bounds - The allowed range
 * @returns The clamped custom period, or undefined when there is no overlap
 */
function clamp(period: Period, bounds: Period): Period | undefined {
  const [inner, outer] = sameKind(period, bounds);
  const start = laterOf(inner.start, outer.start);
  const end = earlierOf(inner.end, outer.end);
  if (compare(start, end) >= EQUAL) {
    return undefined;
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- sameKind() made both periods one kind, so start and end are too
  return { end, start, unit: "custom" } as Period;
}

export { clamp };
