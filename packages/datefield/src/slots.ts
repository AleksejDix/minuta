import type { DateFormat, FormatToken, Segment } from "./types";
import { GAP } from "gap-buffer";

const PLACEHOLDER = "_";

const EDITABLE_TYPES = new Set<string>([
  "day",
  "month",
  "year",
  "hour",
  "minute",
  "second",
]);

type SlotCursor = {
  readonly pos: number;
  readonly slot: number;
};

type SlotStep = {
  readonly next: SlotCursor;
  readonly segment: Segment | undefined;
};

/**
 * Map one format token to its segment and advance the cursor.
 *
 * @param token - Format token to map
 * @param value - GapBuffer value
 * @param cursor - Current string position and slot index
 * @returns The segment (undefined for derived tokens, which occupy no slots) and the next cursor
 */
function tokenToSegment(
  token: Readonly<FormatToken>,
  value: string,
  cursor: SlotCursor
): SlotStep {
  const { pos, slot } = cursor;
  if (token.type === "literal") {
    const end = pos + token.char.length;
    return {
      next: { pos: end, slot },
      segment: { end, start: pos, type: "literal", value: token.char },
    };
  }
  if (!EDITABLE_TYPES.has(token.type)) {
    return { next: cursor, segment: undefined };
  }
  const raw = value.slice(slot, slot + token.length).padEnd(token.length, GAP);
  const end = pos + token.length;
  return {
    next: { pos: end, slot: slot + token.length },
    segment: {
      end,
      start: pos,
      type: token.type,
      value: raw.split(GAP).join(PLACEHOLDER),
    },
  };
}

/**
 * Map a GapBuffer value (editable slots only, gaps as spaces) onto a format.
 *
 * Literals are re-inserted from the format; derived tokens (weekday, era, …)
 * are skipped because they occupy no slots.
 *
 * @example
 * fromSlots(deriveFormat("de-CH"), "3 03") // "3_.03.____"
 * @param format - Format to map onto
 * @param value - GapBuffer value
 * @returns The segments for the format
 */
function fromSlots(format: Readonly<DateFormat>, value: string): Segment[] {
  let cursor: SlotCursor = { pos: 0, slot: 0 };
  const segments: Segment[] = [];
  for (const token of format) {
    const step = tokenToSegment(token, value, cursor);
    cursor = step.next;
    if (step.segment !== undefined) {
      segments.push(step.segment);
    }
  }
  return segments;
}

/**
 * Serialize segments back to a GapBuffer value: editable chars only,
 * placeholders as gaps, trailing gaps stripped (same as GapBuffer.toString).
 *
 * @param segments - Segments to serialize
 * @returns The GapBuffer value
 */
function toSlots(segments: readonly Segment[]): string {
  return segments
    .filter((seg) => EDITABLE_TYPES.has(seg.type))
    .map((seg) => seg.value.split(PLACEHOLDER).join(GAP))
    .join("")
    .replace(/ +$/u, "");
}

export { fromSlots, toSlots };
