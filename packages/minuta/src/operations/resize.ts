import type {
  DatePeriod,
  Period,
  PlainDate,
  TimePeriod,
  ZonedDateTime,
} from "#src/types";
import { compare } from "#src/values";

const EQUAL = 0;

/**
 * Move one edge of a period while keeping the other fixed.
 *
 * Returns undefined if the new edge crosses the fixed edge. Meeting it is
 * fine: the result is an empty period.
 *
 * @example
 * const meeting = range(Temporal.ZonedDateTime.from("2026-03-29T09:00[Europe/Zurich]"), Temporal.ZonedDateTime.from("2026-03-29T10:00[Europe/Zurich]"));
 * resize(meeting, "end", Temporal.ZonedDateTime.from("2026-03-29T11:30[Europe/Zurich]"));
 * // → { start: 9:00, end: 11:30, unit: "custom" }
 *
 * @param period - The period to resize
 * @param edge - Which edge to move
 * @param value - The new value for that edge, of the period's kind
 * @returns The resized custom period, or undefined if the edges would cross
 */
function resize(
  period: DatePeriod,
  edge: "start" | "end",
  value: PlainDate
): DatePeriod | undefined;
function resize(
  period: TimePeriod,
  edge: "start" | "end",
  value: ZonedDateTime
): TimePeriod | undefined;
function resize(
  period: Period,
  edge: "start" | "end",
  value: PlainDate | ZonedDateTime
): Period | undefined {
  let { end, start } = period;
  if (edge === "start") {
    start = value;
  } else {
    end = value;
  }
  if (compare(start, end) > EQUAL) {
    return undefined;
  }
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- The new edge has the period's kind, so both edges do
  return { end, start, unit: "custom" } as Period;
}

export { resize };
