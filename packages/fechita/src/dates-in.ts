/**
 * The date words of free text: the month name, the era and the weekday,
 * and every reading of the numbers next to them.
 */

import { findWord, withoutWord } from "./match";
import { namedReadings, numericReadings } from "./candidates";
import { tablesOf, weekdayTables } from "./context";
import { BC } from "./words";
import type { Context } from "./context";
import type { DateParts } from "./types";
import type { Found } from "./match";
import type { ParseErrorCode } from "./errors";
import type { Reading } from "./candidates";
import { weekdayOf } from "./date";

const ONE = 1;
const NONE = 0;
const DIGIT_RUNS = /\d+/gu;
const WORD_MINIMUMS = { all: 3, own: 1 } as const;
const ERA_MINIMUMS = { all: 3, own: 1 } as const;
// "日" is a Japanese weekday and part of every Japanese date
const WEEKDAY_MINIMUMS = { all: 3, own: 2 } as const;

/**
 * The month word, not taken from inside a weekday: in Welsh "Dydd Mawrth"
 * (Tuesday) contains "Mawrth" (March).
 *
 * @param rest - Text without the time
 * @param context - Words and options
 * @returns The month word, or undefined
 */
function monthIn(rest: string, context: Context): Found | undefined {
  const month = findWord(rest, tablesOf(context, "months"), WORD_MINIMUMS);
  const weekday = findWord(rest, weekdayTables(context), WEEKDAY_MINIMUMS);
  if (
    month === undefined ||
    weekday === undefined ||
    weekday.key === month.key ||
    !weekday.key.includes(month.key)
  ) {
    return month;
  }
  return findWord(
    withoutWord(rest, weekday),
    tablesOf(context, "months"),
    WORD_MINIMUMS
  );
}

function beforeCommonEra(reading: Reading): Reading {
  return {
    day: reading.day,
    month: reading.month,
    order: reading.order,
    year: ONE - reading.year,
  };
}

// The era word, if any: "v. Chr.", "BC", "n. Chr."
function eraIn(rest: string, context: Context): Found | undefined {
  return findWord(rest, tablesOf(context, "eras"), ERA_MINIMUMS);
}

/**
 * The readings next to a month name. With an era the year is as written
 * ("44 v. Chr."), and BC counts back: 1 BC is year 0.
 *
 * @param named - The digit groups and the month 1–12
 * @param rest - Text without the time and the month word
 * @param context - Words and options
 * @returns The readings
 */
function namedWithEra(
  named: Readonly<{ groups: readonly string[]; month: number }>,
  rest: string,
  context: Context
): Reading[] {
  const era = eraIn(rest, context);
  if (era === undefined) {
    return namedReadings(named.groups, named.month, context.referenceYear);
  }
  const readings = namedReadings(named.groups, named.month);
  if (!era.values.has(BC)) {
    return readings;
  }
  return readings.map((reading) => beforeCommonEra(reading));
}

/**
 * Every reading of the text without the time: next to a month name, or of
 * its numbers alone.
 *
 * @param rest - Text without the time
 * @param month - The month word, if any
 * @param context - Words and options
 * @returns The readings, or the reason there are none
 */
function readingsIn(
  rest: string,
  month: Found | undefined,
  context: Context
): Reading[] | ParseErrorCode {
  const groups = rest.match(DIGIT_RUNS) ?? [];
  if (month === undefined) {
    return numericReadings(groups, context.referenceYear);
  }
  const [index = NONE] = month.values;
  if (month.values.size > ONE) {
    return "AMBIGUOUS_MONTH";
  }
  return namedWithEra(
    { groups, month: index + ONE },
    withoutWord(rest, month),
    context
  );
}

/**
 * Whether the weekday in the text, if any, is the weekday of the day read.
 * A month name is not also read as a weekday of another language ("Dis").
 *
 * @param parts - The day read
 * @param found - The month word and the text without the time
 * @param context - Words and options
 * @returns False when the text names another weekday
 */
function weekdayFits(
  parts: DateParts,
  found: Readonly<{ month: Found | undefined; rest: string }>,
  context: Context
): boolean {
  const weekday = findWord(
    withoutWord(found.rest, found.month),
    weekdayTables(context),
    WEEKDAY_MINIMUMS
  );
  return weekday === undefined || weekday.values.has(weekdayOf(parts));
}

// The month word and the readings of the text without the time
function datesIn(
  rest: string,
  context: Context
): Readonly<{
  month: Found | undefined;
  readings: Reading[] | ParseErrorCode;
}> {
  const month = monthIn(rest, context);
  return { month, readings: readingsIn(rest, month, context) };
}

export { datesIn, weekdayFits };
