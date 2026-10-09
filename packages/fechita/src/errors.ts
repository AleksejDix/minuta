/**
 * Why `parseDate` could not return a single date.
 */
const ParseError = {
  /** Day and month can be read both ways (04/05/2026); pass `order` or `locale` */
  AmbiguousDayMonth: "AMBIGUOUS_DAY_MONTH",
  /** A word names different months in the loaded locales; pass `locale` */
  AmbiguousMonth: "AMBIGUOUS_MONTH",
  /** The day does not exist in that month (31 April, 29 February 2026) */
  InvalidDay: "INVALID_DAY",
  /** The month is not 1–12 */
  InvalidMonth: "INVALID_MONTH",
  /** The time is out of range (25:00, 10:61) */
  InvalidTime: "INVALID_TIME",
  /** No day, month and year could be found in the text */
  NoDate: "NO_DATE",
  /** The weekday in the text is not the weekday of the date */
  WeekdayMismatch: "WEEKDAY_MISMATCH",
} as const;

/** One of the {@link ParseError} codes. */
type ParseErrorCode = (typeof ParseError)[keyof typeof ParseError];

export { ParseError };
export type { ParseErrorCode };
