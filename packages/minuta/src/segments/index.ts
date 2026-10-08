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

// Increment
export { incrementSegment } from "./increment";

// Input
export { inputDigit, clearSegment } from "./input";

// Rotate
export { rotateSegment, clampDay } from "./rotate";

// GapBuffer bridge
export { fromSlots, toSlots } from "./slots";
export { GapBuffer, GAP, REGEXP_ONLY_DIGITS } from "./gap-buffer";
export type { Slot, GapBufferOptions } from "./gap-buffer";

export type { InputResult } from "./input";

// Format
export { formatPeriod, formatRange, formatPeriodWith } from "./format";

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
