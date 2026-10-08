/**
 * A fixed-capacity, immutable buffer of slots plus a cursor (gap-buffer).
 *
 * Built for segmented inputs (OTP codes, dates): typing overwrites the slot at
 * the cursor, so correcting one character never shifts the others.
 */
export { GAP, GapBuffer, REGEXP_ONLY_DIGITS } from "./gap-buffer";
export type { GapBufferOptions, Slot } from "./gap-buffer";
