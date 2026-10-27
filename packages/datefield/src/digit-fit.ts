/**
 * What a digit typed into a date or time part does, as in a native date or
 * time input: a first digit no value of the part starts with is padded and
 * the next part follows ("6" in the minute is 06), and a second digit past
 * the part's largest value is refused (hour "2" then "5").
 */

import type { DateFormat, Segment, SegmentType } from "./types";
import { FIXED_RANGES, MAX_DAYS_IN_MONTH } from "./rotate";
import type { InputState } from "@aleksejdix/input-state";
import { parseSegments } from "./parse";

const START = 0;
const ONE_CHAR = 1;
const TWO_DIGITS = 2;
const RADIX = 10;

/** Every part a digit goes into. The year is one, so its digits are never checked against the part after it. */
const DATE_PARTS: ReadonlySet<string> = new Set([
  "day",
  "hour",
  "minute",
  "month",
  "second",
  "year",
]);

type DigitFit = "padded" | "refused" | "typed";

/**
 * The largest value a part takes while it is typed. Finishing the field
 * keeps the day in its month.
 *
 * @param type - The part's type
 * @returns The largest value, or undefined for a part without a fixed range
 */
function largestOf(type: SegmentType): number | undefined {
  if (type === "day") {
    return MAX_DAYS_IN_MONTH;
  }
  const range = FIXED_RANGES[type];
  if (range === undefined) {
    return undefined;
  }
  return range.max;
}

/**
 * The two-digit part the next digit goes into, with its largest value.
 *
 * @param format - The field's format
 * @param state - The field
 * @returns The part and its largest value, or undefined without a range
 */
function rangedPartAt(
  format: Readonly<DateFormat>,
  state: InputState
): Readonly<{ largest: number; seg: Segment }> | undefined {
  const cursor = state.buffer.selection.head;
  const seg = parseSegments(format, state.buffer.text).find(
    (part) => DATE_PARTS.has(part.type) && cursor < part.end
  );
  if (seg === undefined || seg.end - seg.start !== TWO_DIGITS) {
    return undefined;
  }
  const largest = largestOf(seg.type);
  if (largest === undefined) {
    return undefined;
  }
  return { largest, seg };
}

// A first digit no value of the part starts with is padded
function firstDigitFit(digit: string, largest: number): DigitFit {
  if (Number(digit) * RADIX > largest) {
    return "padded";
  }
  return "typed";
}

/**
 * What typing `digit` at the cursor does. The year has no fixed range and
 * takes every digit.
 *
 * @param format - The field's format
 * @param state - The field
 * @param digit - An ASCII digit
 * @returns "padded" to type it and finish the part, "refused" to drop it,
 * "typed" to type it
 */
function digitFit(
  format: Readonly<DateFormat>,
  state: InputState,
  digit: string
): DigitFit {
  const found = rangedPartAt(format, state);
  if (found === undefined) {
    return "typed";
  }
  const { largest, seg } = found;
  if (state.buffer.selection.head <= seg.start) {
    return firstDigitFit(digit, largest);
  }
  if (Number(`${seg.value.slice(START, ONE_CHAR)}${digit}`) > largest) {
    return "refused";
  }
  return "typed";
}

export { digitFit };
