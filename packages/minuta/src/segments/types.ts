/**
 * Editable segment types that map to adapter units.
 * These can be incremented, decremented, and typed into.
 */
export type EditableSegmentType =
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
export type DerivedSegmentType =
  | "era"
  | "weekday"
  | "dayPeriod"
  | "fractionalSecond"
  | "timeZoneName";

/**
 * All segment types: editable, derived, or literal separators.
 */
export type SegmentType = EditableSegmentType | DerivedSegmentType | "literal";

/**
 * A single segment of a formatted date string.
 *
 * @example
 * // The "31" in "31.03.2026"
 * { type: "day", value: "31", start: 0, end: 2 }
 */
export type Segment = {
  type: SegmentType;
  value: string;
  /** Character index where this segment starts in the full string */
  start: number;
  /** Character index where this segment ends (exclusive) */
  end: number;
};

/**
 * A date format token.
 *
 * @example
 * { type: "day", length: 2 }   // DD
 * { type: "literal", char: "." } // .
 */
export type FormatToken =
  | { type: EditableSegmentType | DerivedSegmentType; length: number }
  | { type: "literal"; char: string };

/**
 * Parsed format definition — an ordered list of tokens.
 */
export type DateFormat = FormatToken[];

/**
 * The full state of a segmented date input.
 */
export type SegmentedDate = {
  segments: Segment[];
  activeIndex: number;
};
