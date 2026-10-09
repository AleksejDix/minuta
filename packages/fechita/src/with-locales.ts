import type { Locales, ParseOptions } from "./types";
import type { ParseResult } from "./parse";
import { parseDateWith } from "./parse";

/**
 * The functions of fechita bound to one set of locales, as returned by
 * `withLocales`. Each member has the type of its counterpart in the default
 * entry, so the two cannot drift apart.
 */
type Fechita = Readonly<{
  /** The locales the functions read */
  locales: Locales;
  /** Same as `parseDate` in the default entry */
  parseDate: (text: string, options?: ParseOptions) => ParseResult;
}>;

/**
 * Bind fechita to the locales you need.
 *
 * @example
 * import { withLocales } from "fechita/core";
 * import { de } from "fechita/locales/de";
 *
 * const { parseDate } = withLocales({ de });
 * parseDate("31. März 2026").valid; // true
 *
 * @param locales - Locale data by tag
 * @returns The bound functions
 */
function withLocales(locales: Locales): Fechita {
  return {
    locales,
    parseDate: (text, options) => parseDateWith(locales, text, options),
  };
}

export { withLocales };
export type { Fechita };
