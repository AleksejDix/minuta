/**
 * Times of day in free text: `10:30`, `14:5`, `10:30:15.250`, `14.05`
 * (Danish, Finnish), `2:05 PM`, `오후 2:05`, `晚上11:59`; offsets `Z`,
 * `+02:00`, `+0200`, `GMT+1`, `UTC`.
 */

import { rangeOf, wordRuns } from "./words";
import { MIDNIGHT } from "./date";
import type { Tables } from "./match";
import type { WordTable } from "./words";
import { groupsOf } from "./regex";

const COLON_TIME =
  /(?<![\d:])(?<hour>\d{1,2}):(?<minute>\d{1,2})(?!\d)(?::(?<second>\d{2})(?:[.,](?<fraction>\d{1,9}))?)?(?:\s*(?<offset>z(?!\p{L})|(?:gmt|utc)?\s*[+\-−]\d{1,2}(?::?\d{2})?|gmt|utc))?/giu;
// "14.05" or "00.07.00" (Danish, Finnish): only next to a full date, since
// "12.03.26" alone is a date
const DOT_TIME =
  /(?<![\d.])(?<hour>\d{1,2})\.(?<minute>\d{2})(?:\.(?<second>\d{2}))?(?![\d.])/gu;
const OFFSET = /(?<sign>[+\-−])(?<hours>\d{1,2})(?::?(?<minutes>\d{2}))?/gu;
const WORDS_AFTER =
  /^\s*(?<words>(?:[\p{L}\p{M}.]|‌|‍)+(?:\s+(?:[\p{L}\p{M}.]|‌|‍)+)?)/gu;
const WORDS_BEFORE =
  /(?<words>(?:[\p{L}\p{M}.]|‌|‍)+(?:\s+(?:[\p{L}\p{M}.]|‌|‍)+)?)\s*$/gu;
const DIGIT_RUNS = /\d+/gu;

const MINUTES_PER_HOUR = 60;
const HOURS_PER_HALF_DAY = 12;
const MAX_HOUR = 23;
const MAX_MINUTE = 59;
const MAX_SECOND = 60;
const MS_DIGITS = 3;
const DATE_GROUPS = 3;
const NONE = 0;
const NEGATIVE = -1;
const POSITIVE = 1;

/** A time of day read from text, and the text left without it. */
type TimeOfDay = Readonly<{
  hour: number;
  millisecond: number;
  minute: number;
  offsetMinutes: number | undefined;
  rest: string;
  second: number;
  valid: boolean;
}>;

type Groups = Readonly<Record<string, string | undefined>>;

/** Where a time was found: its text, its bounds and the text around it. */
type Found = Readonly<{
  after: string;
  before: string;
  groups: Groups;
}>;

function signOf(sign: string | undefined): number {
  if (sign === "+") {
    return POSITIVE;
  }
  return NEGATIVE;
}

function offsetOf(text: string | undefined): number | undefined {
  if (text === undefined) {
    return undefined;
  }
  const groups = groupsOf(text, OFFSET);
  if (groups === undefined) {
    // Z, GMT or UTC alone
    return NONE;
  }
  const minutes =
    Number(groups["hours"]) * MINUTES_PER_HOUR +
    Number(groups["minutes"] ?? NONE);
  return signOf(groups["sign"]) * minutes;
}

function periodIn(
  words: string | undefined,
  periods: WordTable | undefined
): ReadonlySet<number> | undefined {
  if (words === undefined || periods === undefined) {
    return undefined;
  }
  for (const run of wordRuns(words)) {
    const values = periods.valuesOf(run);
    if (values !== undefined) {
      return values;
    }
  }
  return undefined;
}

function inRange(
  hour: number,
  range: Readonly<{ before: number; from: number }>
): boolean {
  if (range.from < range.before) {
    return hour >= range.from && hour < range.before;
  }
  // A range across midnight, e.g. from 21 before 6
  return hour >= range.from || hour < range.before;
}

/**
 * The hour of the day a written 12-hour hour means with a day period:
 * AM/PM, or the one of `h` and `h + 12` inside a flexible period's range.
 *
 * @param written - The written hour, 1–12
 * @param value - A value of the `periods` table
 * @returns The hours it can mean (none when it does not fit the period)
 */
function hoursWith(written: number, value: number): number[] {
  const morning = written % HOURS_PER_HALF_DAY;
  const range = rangeOf(value);
  if (range === undefined) {
    return [morning + value];
  }
  return [morning, morning + HOURS_PER_HALF_DAY].filter((hour) =>
    inRange(hour, range)
  );
}

/**
 * The hour a day-period word gives a written hour. Meanings that do not fit
 * drop out ("오후" is PM and 12–18); the rest must agree.
 *
 * @param written - The written hour
 * @param values - What the word names
 * @returns The hour, or undefined without a period or when they disagree
 */
function periodHour(
  written: number,
  values: ReadonlySet<number> | undefined
): number | undefined {
  if (values === undefined || written > HOURS_PER_HALF_DAY) {
    return undefined;
  }
  const hours = new Set(
    [...values].flatMap((value) => hoursWith(written, value))
  );
  const [only] = hours;
  if (hours.size !== POSITIVE) {
    return undefined;
  }
  return only;
}

function wordsIn(text: string, pattern: Readonly<RegExp>): string | undefined {
  const groups = groupsOf(text, pattern);
  if (groups === undefined) {
    return undefined;
  }
  return groups["words"];
}

/**
 * The day-period word touching the time: right after it ("2:05 PM") or
 * right before it ("오후 2:05"), the locale's own words first, so the German
 * "am" (on) elsewhere in the text is not one.
 *
 * @param found - The time and the text around it
 * @param periods - Day-period words of the own and all loaded locales
 * @returns What the word names, or undefined
 */
function periodNear(
  found: Found,
  periods: Tables
): ReadonlySet<number> | undefined {
  const after = wordsIn(found.after, WORDS_AFTER);
  const before = wordsIn(found.before, WORDS_BEFORE);
  for (const table of [periods.own, periods.all]) {
    const values = periodIn(after, table) ?? periodIn(before, table);
    if (values !== undefined) {
      return values;
    }
  }
  return undefined;
}

type Position = Readonly<{ end: number; groups: Groups; start: number }>;

function foundAt(text: string, position: Position): Found {
  return {
    after: text.slice(position.end),
    before: text.slice(NONE, position.start),
    groups: position.groups,
  };
}

function positionsOf(text: string, pattern: Readonly<RegExp>): Position[] {
  const positions: Position[] = [];
  for (const match of text.matchAll(pattern)) {
    positions.push({
      end: match.index + match[NONE].length,
      groups: match.groups ?? {},
      start: match.index,
    });
  }
  return positions;
}

// Whether the text without the time still holds a full date
function leavesDate(found: Found): boolean {
  const rest = `${found.before} ${found.after}`;
  return (rest.match(DIGIT_RUNS) ?? []).length >= DATE_GROUPS;
}

/**
 * The time in the text: with a colon, or else the last dot-separated time
 * that leaves a full date.
 *
 * @param text - Normalised text
 * @returns Where the time was found, or undefined
 */
function timeFound(text: string): Found | undefined {
  const [colon] = positionsOf(text, COLON_TIME);
  if (colon !== undefined) {
    return foundAt(text, colon);
  }
  return positionsOf(text, DOT_TIME)
    .map((position) => foundAt(text, position))
    .filter((found) => leavesDate(found))
    .at(NEGATIVE);
}

function fractionOf(groups: Groups): number {
  return Number(
    (groups["fraction"] ?? "").padEnd(MS_DIGITS, "0").slice(NONE, MS_DIGITS)
  );
}

/**
 * The time of day in `text`, if any.
 *
 * @param text - Normalised text
 * @param periods - Day-period words of the own and all loaded locales
 * @returns The time and the remaining text, or undefined without a time
 */
function timeIn(text: string, periods: Tables): TimeOfDay | undefined {
  const found = timeFound(text);
  if (found === undefined) {
    return undefined;
  }
  const { groups } = found;
  const written = Number(groups["hour"]);
  const hour = periodHour(written, periodNear(found, periods)) ?? written;
  const minute = Number(groups["minute"]);
  const second = Number(groups["second"] ?? NONE);
  return {
    hour,
    millisecond: fractionOf(groups),
    minute,
    offsetMinutes: offsetOf(groups["offset"]),
    rest: `${found.before} ${found.after}`,
    second,
    valid: hour <= MAX_HOUR && minute <= MAX_MINUTE && second <= MAX_SECOND,
  };
}

/**
 * The whole text at midnight, when it holds no time.
 *
 * @param text - Normalised text
 * @returns Midnight with the text as the rest
 */
function untimed(text: string): TimeOfDay {
  return {
    hour: MIDNIGHT.hour,
    millisecond: MIDNIGHT.millisecond,
    minute: MIDNIGHT.minute,
    offsetMinutes: MIDNIGHT.offsetMinutes,
    rest: text,
    second: MIDNIGHT.second,
    valid: true,
  };
}

export { timeIn, untimed };
