/**
 * Finding a date word in text the way languages write them: as a word
 * ("März"), with a suffix ("martxoaren", "сарын"), after a one-letter
 * Hebrew prefix ("במרץ") or inside text without spaces ("火曜日").
 */

import type { WordTable } from "./words";
import { wordKey } from "./text";

const ONE = 1;
const START = 0;
const NOT_FOUND = -1;
const HEBREW_PREFIX = 1;

const LETTER = /[\p{L}\p{M}\u200C\u200D]/u;
const NO_SPACES =
  /[\p{sc=Han}\p{sc=Hiragana}\p{sc=Katakana}\p{sc=Thai}\p{sc=Lao}\p{sc=Khmer}\p{sc=Myanmar}]/u;
const HEBREW = /\p{sc=Hebrew}/u;

/** The own locale's table, if a locale is known, and the shared one. */
type Tables = Readonly<{ all: WordTable; own: WordTable | undefined }>;

/** A word found in text: its key and the values it names. */
type Found = Readonly<{ key: string; values: ReadonlySet<number> }>;

function isLetter(char: string | undefined): boolean {
  return char !== undefined && LETTER.test(char);
}

/**
 * Whether a match at `index` starts a word: at the start, after a non-letter,
 * in a script without spaces, or after one Hebrew prefix letter.
 *
 * @param text - Text key
 * @param index - Where the name starts
 * @returns Whether the name may start there
 */
function startsWord(text: string, index: number): boolean {
  const before = text[index - ONE];
  if (!isLetter(before) || NO_SPACES.test(text[index] ?? "")) {
    return true;
  }
  return (
    HEBREW.test(before ?? "") && !isLetter(text[index - ONE - HEBREW_PREFIX])
  );
}

function indexIn(text: string, key: string): number {
  let index = text.indexOf(key);
  while (index !== NOT_FOUND && !startsWord(text, index)) {
    index = text.indexOf(key, index + ONE);
  }
  return index;
}

/**
 * The longest name of `table` in `text` that is at least `minLength`
 * characters long.
 *
 * @param text - Text key (see `wordKey`)
 * @param table - Names by key
 * @param minLength - Shortest name to accept, in characters
 * @returns The name found, or undefined
 */
function longestIn(
  text: string,
  table: WordTable,
  minLength: number
): Found | undefined {
  for (const key of table.keys) {
    const values = table.valuesOf(key);
    if (
      key.length >= minLength &&
      values !== undefined &&
      indexIn(text, key) !== NOT_FOUND
    ) {
      return { key, values };
    }
  }
  return undefined;
}

/**
 * Find a date word in text: the locale's own words first, then those of
 * every loaded locale, each with its own shortest accepted length (short
 * words of other languages are too common: "月", "일", "de").
 *
 * @param text - Normalised text
 * @param tables - The own table (if a locale is known) and the shared one
 * @param minimums - Shortest own and shared word to accept, in characters
 * @returns The word found, or undefined
 */
function findWord(
  text: string,
  tables: Tables,
  minimums: Readonly<{ all: number; own: number }>
): Found | undefined {
  const key = wordKey(text);
  if (tables.own !== undefined) {
    const own = longestIn(key, tables.own, minimums.own);
    if (own !== undefined) {
      return own;
    }
  }
  return longestIn(key, tables.all, minimums.all);
}

/**
 * The text without the word that was found, so a month name is not read as
 * a weekday of another language.
 *
 * @param text - Normalised text
 * @param found - The word found in it
 * @returns The text key without the word
 */
function withoutWord(text: string, found: Found | undefined): string {
  const key = wordKey(text);
  if (found === undefined) {
    return key;
  }
  const index = indexIn(key, found.key);
  return `${key.slice(START, index)} ${key.slice(index + found.key.length)}`;
}

export { findWord, withoutWord };
export type { Found, Tables };
