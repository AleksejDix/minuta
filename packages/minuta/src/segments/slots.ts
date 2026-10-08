import type { DateFormat, Segment } from "./types";
import { GAP } from "./gap-buffer";

const PLACEHOLDER = "_";

const EDITABLE_TYPES = new Set<string>([
  "day",
  "month",
  "year",
  "hour",
  "minute",
  "second",
]);

/**
 * Map a GapBuffer value (editable slots only, gaps as spaces) onto a format.
 *
 * Literals are re-inserted from the format; derived tokens (weekday, era, …)
 * are skipped because they occupy no slots.
 *
 * @example
 * fromSlots(deriveFormat("de-CH"), "3 03") // "3_.03.____"
 */
export function fromSlots(format: DateFormat, value: string): Segment[] {
  const segments: Segment[] = [];
  let pos = 0;
  let slot = 0;

  for (const token of format) {
    if (token.type === "literal") {
      segments.push({
        type: "literal",
        value: token.char,
        start: pos,
        end: pos + token.char.length,
      });
      pos += token.char.length;
      continue;
    }
    if (!EDITABLE_TYPES.has(token.type)) continue;

    const raw = value
      .slice(slot, slot + token.length)
      .padEnd(token.length, GAP);
    segments.push({
      type: token.type,
      value: raw.split(GAP).join(PLACEHOLDER),
      start: pos,
      end: pos + token.length,
    });
    pos += token.length;
    slot += token.length;
  }

  return segments;
}

/**
 * Serialize segments back to a GapBuffer value: editable chars only,
 * placeholders as gaps, trailing gaps stripped (same as GapBuffer.toString).
 */
export function toSlots(segments: Segment[]): string {
  return segments
    .filter((s) => EDITABLE_TYPES.has(s.type))
    .map((s) => s.value.split(PLACEHOLDER).join(GAP))
    .join("")
    .replace(/ +$/, "");
}
