/**
 * Editable segment types that map to adapter units.
 * These can be incremented, decremented, and typed into.
 */
type EditableSegmentType =
  | "day"
  | "month"
  | "year"
  | "hour"
  | "minute"
  | "second";

/**
 * Derived segment types from Intl.DateTimeFormat.
 * These are display-only — computed from the date, not directly editable.
 */
type DerivedSegmentType =
  | "era"
  | "weekday"
  | "dayPeriod"
  | "fractionalSecond"
  | "timeZoneName";

/**
 * All segment types: editable, derived, or literal separators.
 */
type SegmentType = EditableSegmentType | DerivedSegmentType | "literal";

/**
 * A single segment of a formatted date string.
 *
 * @example
 * // The "31" in "31.03.2026"
 * { type: "day", value: "31", start: 0, end: 2 }
 */
type Segment = {
  readonly type: SegmentType;
  readonly value: string;
  /** Character index where this segment starts in the full string */
  readonly start: number;
  /** Character index where this segment ends (exclusive) */
  readonly end: number;
};

/**
 * A date format token.
 *
 * @example
 * // DD
 * { type: "day", length: 2 }
 * // .
 * { type: "literal", char: "." }
 */
type FormatToken =
  | {
      readonly type: EditableSegmentType | DerivedSegmentType;
      readonly length: number;
    }
  | { readonly type: "literal"; readonly char: string };

/**
 * Parsed format definition — an ordered list of tokens.
 */
type DateFormat = FormatToken[];

/**
 * The full state of a segmented date input.
 */
type SegmentedDate = {
  segments: Segment[];
  activeIndex: number;
};

export type {
  DateFormat,
  DerivedSegmentType,
  EditableSegmentType,
  FormatToken,
  Segment,
  SegmentedDate,
  SegmentType,
};
