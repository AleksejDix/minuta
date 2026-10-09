/**
 * Indexes of the date words of a set of locales: month and weekday names,
 * day periods and eras, looked up by word key.
 */

import type { LocaleData, Locales } from "./types";
import { isWord, wordKey } from "./text";

/** Date words by key: what each names (several values when locales disagree). */
type WordTable = Readonly<{
  /** The keys, longest first, so "çərşənbə axşamı" is found before "çərşənbə" */
  keys: readonly string[];
  /** The values a key names, or undefined */
  valuesOf: (key: string) => ReadonlySet<number> | undefined;
}>;

/** The date words of some locales. */
type Words = Readonly<{
  eras: WordTable;
  months: WordTable;
  periods: WordTable;
  weekdays: WordTable;
}>;

type Entry = readonly [name: string, value: number];

/** Value of an AM word in `periods`. */
const AM = 0;
/** Value of a PM word in `periods`. */
const PM = 12;
/** Value of a BC word in `eras`. */
const BC = 0;
/** Value of an AD word in `eras`. */
const AD = 1;

// A flexible day period is stored as one number holding its hour range
const FLEXIBLE = 1000;
const RANGE_BASE = 25;
const ONE = 1;
const START = 0;
const MAX_WORDS_PER_NAME = 3;
// Letters with their marks, joiners (ZWNJ in Persian) and abbreviation dots
const WORD = /(?:[\p{L}\p{M}.\u0970]|\u200C|\u200D)+/gu;

/**
 * The `periods` value of a flexible day period covering `from` until before
 * `before` (hours 0–24).
 *
 * @param from - First hour
 * @param before - Hour it ends before
 * @returns The encoded value
 */
function flexiblePeriod(from: number, before: number): number {
  return FLEXIBLE + from * RANGE_BASE + before;
}

/**
 * The hour range of a `periods` value, or undefined for AM and PM.
 *
 * @param value - A value of the `periods` table
 * @returns The range, or undefined
 */
function rangeOf(
  value: number
): Readonly<{ before: number; from: number }> | undefined {
  if (value < FLEXIBLE) {
    return undefined;
  }
  const range = value - FLEXIBLE;
  return { before: range % RANGE_BASE, from: Math.floor(range / RANGE_BASE) };
}

function indexed(lists: readonly (readonly string[])[]): Entry[] {
  return lists.flatMap((names, value) =>
    names.map((name): Entry => [name, value])
  );
}

function valued(names: readonly string[], value: number): Entry[] {
  return names.map((name): Entry => [name, value]);
}

function periodEntries(locale: LocaleData): Entry[] {
  const { am, flexible, pm } = locale.dayPeriods;
  return [
    ...valued(am, AM),
    ...valued(pm, PM),
    ...flexible.flatMap((period) =>
      valued(period.names, flexiblePeriod(period.from, period.before))
    ),
  ];
}

function tableOf(entries: readonly Entry[]): WordTable {
  const table = new Map<string, ReadonlySet<number>>();
  for (const [name, value] of entries) {
    const key = wordKey(name);
    if (isWord(key)) {
      table.set(key, new Set([...(table.get(key) ?? []), value]));
    }
  }
  // oxlint-disable-next-line unicorn/no-array-sort -- Sorts a fresh copy of the keys; toSorted is ES2023
  const keys = [...table.keys()].sort(
    (left, right) => right.length - left.length
  );
  return { keys, valuesOf: (key) => table.get(key) };
}

/**
 * Index the date words of `locales`.
 *
 * @param locales - Locale data
 * @returns The word tables
 */
function wordsOf(locales: readonly LocaleData[]): Words {
  return {
    eras: tableOf(
      locales.flatMap((locale) => [
        ...valued(locale.eras.bc, BC),
        ...valued(locale.eras.ad, AD),
      ])
    ),
    months: tableOf(locales.flatMap((locale) => indexed(locale.months))),
    periods: tableOf(locales.flatMap((locale) => periodEntries(locale))),
    weekdays: tableOf(locales.flatMap((locale) => indexed(locale.weekdays))),
  };
}

/**
 * The locale data of a tag, trying ever shorter tags: `de-CH` → `de`.
 *
 * @param locales - Available locale data
 * @param tag - BCP 47 tag
 * @returns The data, or undefined
 */
function localeFor(locales: Locales, tag: string): LocaleData | undefined {
  const parts = tag.split("-");
  const prefixes = parts.map((_part, index) =>
    parts.slice(START, parts.length - index).join("-")
  );
  const match = prefixes.find((prefix) => Object.hasOwn(locales, prefix));
  if (match === undefined) {
    return undefined;
  }
  return locales[match];
}

/**
 * The word keys of `text` and of every run of up to three of its words, so
 * names like "de gener" match.
 *
 * @param text - Normalised text
 * @returns The candidate word keys
 */
function wordRuns(text: string): string[] {
  const words = (text.match(WORD) ?? [])
    .map((word) => wordKey(word))
    .filter((key) => isWord(key));
  return words.flatMap((_word, start) =>
    Array.from(
      { length: Math.min(MAX_WORDS_PER_NAME, words.length - start) },
      (_unused, size) => words.slice(start, start + size + ONE).join(" ")
    )
  );
}

export { AD, AM, BC, PM, localeFor, rangeOf, wordRuns, wordsOf };
export type { WordTable, Words };
