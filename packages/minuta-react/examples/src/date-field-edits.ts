import {
  backspace,
  beforeInput,
  pasteText,
  pressKey,
  renderField,
  select,
  shown,
  typeText,
} from "./date-field-test-utils";
import { deriveFormat, placeholder } from "@aleksejdix/datefield";
import type { Field } from "./date-field-test-utils";
import { cleanup } from "@testing-library/react";
import { isoDate } from "./date-field-dates";

const SEED = 1028;
const RANDOM_EDITS = 300;
const FIRST_YEAR = 1990;
const YEAR_SPAN = 60;
const MONTHS = 12;
const LONGEST_MONTH = 31;
const SPREAD = 10_000;
const BASE = 10;
const DIGITS = Array.from({ length: BASE }, (_unused, digit) => String(digit));
const SEPARATORS = [".", "/", "-", " "];
const KEYS = ["ArrowUp", "ArrowDown", "ArrowLeft", "Home"];
// Day 0 of a month is the last day of the month before
const LAST_OF_PREVIOUS = 0;
const EMPTY_SLOT = "_";
const ONE = 1;

type Random = () => number;

// The fractional part of a sine: deterministic, so a failure replays exactly
function seeded(seed: number): Random {
  let state = seed;
  return () => {
    state += ONE;
    const spread = Math.sin(state) * SPREAD;
    return spread - Math.floor(spread);
  };
}

function below(random: Random, limit: number): number {
  return Math.floor(random() * limit);
}

function pick<Item>(random: Random, items: readonly Item[]): Item {
  const item = items[below(random, items.length)];
  if (item === undefined) {
    throw new RangeError("Cannot pick from an empty list");
  }
  return item;
}

function randomDate(random: Random): Date {
  const year = FIRST_YEAR + below(random, YEAR_SPAN);
  const month = below(random, MONTHS);
  const days = new Date(year, month + ONE, LAST_OF_PREVIOUS).getDate();
  return new Date(year, month, ONE + below(random, days));
}

type Edit = (random: Random, field: Field, length: number) => string;

// Everything people do in a date field: type, delete, move, select, step, paste
const EDITS: readonly Edit[] = [
  (random, field) => {
    const digit = pick(random, DIGITS);
    typeText(field.input, digit);
    return `type ${digit}`;
  },
  (random, field) => {
    const separator = pick(random, SEPARATORS);
    typeText(field.input, separator);
    return `type ${JSON.stringify(separator)}`;
  },
  (_random, field) => {
    backspace(field.input);
    return "backspace";
  },
  (_random, field) => {
    beforeInput(field.input, "deleteContentForward");
    return "delete";
  },
  (random, field, length) => {
    const at = below(random, length + ONE);
    select(field.input, at);
    return `cursor ${String(at)}`;
  },
  (random, field, length) => {
    const from = below(random, length);
    const to = from + below(random, length - from + ONE);
    select(field.input, from, to);
    return `select ${String(from)}–${String(to)}`;
  },
  (random, field) => {
    const key = pick(random, KEYS);
    pressKey(field.input, key);
    return key;
  },
  (random, field) => {
    const text = pick(random, [
      isoDate(randomDate(random)),
      randomDate(random).toDateString(),
      "hello",
      String(below(random, LONGEST_MONTH)),
    ]);
    pasteText(field.input, text);
    return `paste ${JSON.stringify(text)}`;
  },
];

function literalsKept(template: string, text: string): boolean {
  for (let index = 0; index < template.length; index += ONE) {
    const char = template.charAt(index);
    if (char !== EMPTY_SLOT && text.charAt(index) !== char) {
      return false;
    }
  }
  return true;
}

/**
 * What is wrong with the field, if anything: the mask's length and literals
 * never change, and a reported date is exactly the date the field shows.
 *
 * @param locale - Locale of the field
 * @param template - The empty field, e.g. `__.__.____`
 * @param field - The field
 * @returns A description of the problem, or undefined
 */
function malformed(
  locale: string,
  template: string,
  field: Field
): string | undefined {
  const text = field.input.value;
  if (text.length !== template.length) {
    return `length of ${JSON.stringify(text)}`;
  }
  if (!literalsKept(template, text)) {
    return `separators of ${JSON.stringify(text)}`;
  }
  const date = field.date();
  if (date !== undefined && shown(locale, date) !== text) {
    return `reported ${date.toDateString()} for ${JSON.stringify(text)}`;
  }
  return undefined;
}

// Apply the edits one by one, noting each that left the field malformed
function editProblems(locale: string, field: Field, random: Random): string[] {
  const template = placeholder(deriveFormat(locale));
  const broken: string[] = [];
  for (let edit = 0; edit < RANDOM_EDITS; edit += ONE) {
    const action = pick(random, EDITS)(random, field, template.length);
    const problem = malformed(locale, template, field);
    if (problem !== undefined) {
      broken.push(`after ${action}: ${problem}`);
    }
  }
  return broken;
}

/**
 * Applies a seeded run of random edits, checking the field after each.
 *
 * @param locale - Locale of the field
 * @returns The edits that left the field malformed
 */
function brokenEdits(locale: string): string[] {
  const field = renderField(locale);
  const broken = editProblems(locale, field, seeded(SEED + locale.length));
  cleanup();
  return broken;
}

export { brokenEdits };
