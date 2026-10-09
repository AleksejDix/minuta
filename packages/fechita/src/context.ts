/**
 * What a parse reads with: the words of every loaded locale and those of the
 * text's own locale, cached per set of locales.
 */

import type { LocaleData, Locales, ParseOptions } from "./types";
import { localeFor, wordsOf } from "./words";
import type { Tables } from "./match";
import type { Words } from "./words";

// Without a locale, English is the lingua franca of short date words: BC, AM
const LINGUA_FRANCA = "en";

/** What a parse reads with: the words of all and of the own locale. */
type Context = Readonly<{
  locales: Locales;
  options: ParseOptions;
  own: Words | undefined;
  words: Words;
}>;

// Word indexes are built once per set of locales and per own locale
const INDEXES = new WeakMap<Locales, Words>();
const OWN_INDEXES = new WeakMap<LocaleData, Words>();

function indexOf(locales: Locales): Words {
  const cached = INDEXES.get(locales) ?? wordsOf(Object.values(locales));
  INDEXES.set(locales, cached);
  return cached;
}

function ownIndexOf(
  locales: Locales,
  tag: string | undefined
): Words | undefined {
  if (tag === undefined) {
    return undefined;
  }
  const data = localeFor(locales, tag);
  if (data === undefined) {
    return undefined;
  }
  const cached = OWN_INDEXES.get(data) ?? wordsOf([data]);
  OWN_INDEXES.set(data, cached);
  return cached;
}

function tablesOf(context: Context, kind: keyof Words): Tables {
  if (context.own === undefined) {
    return { all: context.words[kind], own: undefined };
  }
  return { all: context.words[kind], own: context.own[kind] };
}

// With a known locale only its own weekdays count: "tháng" is no weekday
function weekdayTables(context: Context): Tables {
  if (context.own === undefined) {
    return tablesOf(context, "weekdays");
  }
  return { all: context.own.weekdays, own: undefined };
}

/**
 * The words a parse reads with.
 *
 * @param locales - The loaded locales
 * @param options - The parse options
 * @returns The context
 */
function contextOf(locales: Locales, options: ParseOptions): Context {
  return {
    locales,
    options,
    own: ownIndexOf(locales, options.locale ?? LINGUA_FRANCA),
    words: indexOf(locales),
  };
}

export { contextOf, tablesOf, weekdayTables };
export type { Context };
