/**
 * Bridge between a locale date format and an input-state field: the format
 * becomes a mask, and segment edits (rotation, clamping) are written back into
 * the field without moving the cursor.
 */

import type { DateFormat, FormatToken, Segment } from "./types";
import type { InputState, Mask, MaskToken } from "input-state";
import { createTextBuffer } from "text-buffer";
import { segmentsToString } from "./convert";

const DEFAULT_PLACEHOLDER = "_";

const DIGIT_SLOT: MaskToken = { accepts: "digit", kind: "slot" };

const EDITABLE_TYPES: ReadonlySet<FormatToken["type"]> = new Set([
  "day",
  "hour",
  "minute",
  "month",
  "second",
  "year",
]);

function tokenToMask(token: Readonly<FormatToken>): MaskToken[] {
  if (token.type === "literal") {
    return Array.from(token.char, (char) => ({ char, kind: "literal" }));
  }
  if (!EDITABLE_TYPES.has(token.type)) {
    throw new RangeError(
      `Display-only part "${token.type}" cannot be typed into a date mask`
    );
  }
  return Array.from({ length: token.length }, () => DIGIT_SLOT);
}

/**
 * Turn a date format into an input mask: editable parts become digit slots,
 * separators become literals (`de-CH` → `__.__.____`).
 *
 * @param format - Format from `deriveFormat`; display-only parts are rejected
 * @param placeholder - Character shown in empty slots
 * @returns The mask
 * @throws {RangeError} When the format contains weekday, era or other display-only parts
 */
function dateMask(
  format: Readonly<DateFormat>,
  placeholder: string = DEFAULT_PLACEHOLDER
): Mask {
  return { placeholder, tokens: format.flatMap((token) => tokenToMask(token)) };
}

/**
 * Write segments (e.g. after `rotateSegment` or `clampDay`) back into the
 * field, keeping the selection and mode.
 *
 * @param state - Field to update
 * @param segments - Segments describing the new text
 * @returns The new state, or the same state when the text is unchanged
 */
function withSegments(
  state: InputState,
  segments: readonly Segment[]
): InputState {
  const text = segmentsToString(segments);
  if (text === state.buffer.text) {
    return state;
  }
  return {
    buffer: createTextBuffer(text, state.buffer.selection),
    mask: state.mask,
    mode: state.mode,
  };
}

export { dateMask, withSegments };
