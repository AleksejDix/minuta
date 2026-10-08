/**
 * Headless logic for segmented date inputs like DD.MM.YYYY (datefield).
 *
 * Locale formats come from Intl.DateTimeFormat; editing runs on the gap-buffer package,
 * so correcting one digit never shifts the rest. Framework-agnostic: wire the
 * pure functions to DOM events in your framework of choice.
 */
// Parse
export {
  deriveFormat,
  parseSegments,
  placeholder,
  formatLength,
} from "./parse";

// Navigate
export {
  segmentAtPosition,
  nextSegment,
  previousSegment,
  firstEditableIndex,
  lastEditableIndex,
} from "./navigate";

// Convert
export { toDate, fromDate, segmentsToString } from "./convert";

// Input
export { inputDigit, clearSegment } from "./input";

// Rotate
export { rotateSegment, clampDay } from "./rotate";

// Bridge to the gap-buffer package
export { fromSlots, toSlots } from "./slots";

export type { InputResult } from "./input";

// Types
export type {
  Segment,
  SegmentType,
  EditableSegmentType,
  DerivedSegmentType,
  SegmentedDate,
  DateFormat,
  FormatToken,
} from "./types";
