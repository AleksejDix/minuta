/**
 * The rules without the data, like ibanita's core: pair `withLocales` with
 * the locales you need from `fechita/locales/<tag>`.
 *
 * @module fechita/core
 */
export { ParseError } from "./errors";
export type { ParseErrorCode } from "./errors";
export { parseDateWith } from "./parse";
export type { ParseResult } from "./parse";
export { withLocales } from "./with-locales";
export type { Fechita } from "./with-locales";
export type {
  DateParts,
  LocaleData,
  Locales,
  Order,
  ParseOptions,
} from "./types";
