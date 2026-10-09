/**
 * ISO 8601 and RFC 3339 dates and date-times, read exactly: `2026-03-31`,
 * `2026-03-31T10:00`, `2026-03-31 10:00:00.250+02:00`, `20260331T100000Z`.
 */

import { groupsOf } from "./regex";

const ISO =
  /^(?<year>[+-]?\d{4,6})-?(?<month>\d{2})-?(?<day>\d{2})(?:[t\s](?<hour>\d{2}):?(?<minute>\d{2})(?::?(?<second>\d{2})(?:[.,](?<fraction>\d{1,9}))?)?\s*(?<offset>z|[+-]\d{2}(?::?\d{2})?)?)?$/giu;
const OFFSET = /^(?<sign>[+-])(?<hours>\d{2}):?(?<minutes>\d{2})?$/gu;
const MINUTES_PER_HOUR = 60;
const MS_DIGITS = 3;
const NONE = 0;
const NEGATIVE = -1;
const POSITIVE = 1;

/** The fields of an ISO 8601 text, as written. */
type IsoFields = Readonly<{
  day: number;
  hour: number;
  millisecond: number;
  minute: number;
  month: number;
  offsetMinutes: number | undefined;
  second: number;
  year: number;
}>;

function signOf(sign: string | undefined): number {
  if (sign === "-") {
    return NEGATIVE;
  }
  return POSITIVE;
}

function offsetMinutesOf(offset: string | undefined): number | undefined {
  if (offset === undefined) {
    return undefined;
  }
  const groups = groupsOf(offset, OFFSET);
  if (groups === undefined) {
    // Z
    return NONE;
  }
  const minutes =
    Number(groups["hours"]) * MINUTES_PER_HOUR +
    Number(groups["minutes"] ?? NONE);
  return signOf(groups["sign"]) * minutes;
}

/**
 * The fields of an ISO 8601 / RFC 3339 date or date-time, basic or extended.
 *
 * @param text - Normalised text
 * @returns The fields as written, or undefined when the text is not ISO 8601
 */
function isoFields(text: string): IsoFields | undefined {
  const groups = groupsOf(text, ISO);
  if (groups === undefined) {
    return undefined;
  }
  return {
    day: Number(groups["day"]),
    hour: Number(groups["hour"] ?? NONE),
    millisecond: Number(
      (groups["fraction"] ?? "").padEnd(MS_DIGITS, "0").slice(NONE, MS_DIGITS)
    ),
    minute: Number(groups["minute"] ?? NONE),
    month: Number(groups["month"]),
    offsetMinutes: offsetMinutesOf(groups["offset"]),
    second: Number(groups["second"] ?? NONE),
    year: Number(groups["year"]),
  };
}

export { isoFields };
export type { IsoFields };
