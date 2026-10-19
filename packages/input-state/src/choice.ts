// Choices under a mask: one of a few fixed texts, written and cleared whole

import type { Mask, MaskToken } from "./mask";
import type { TextBuffer } from "text-buffer";
import { paddedOption } from "./mask";
import { replaceRange } from "text-buffer";

type ChoiceToken = Extract<MaskToken, { kind: "choice" }>;

/** Where a choice sits in the text: its first position and its width. */
type ChoiceSpan = Readonly<{
  from: number;
  options: readonly string[];
  to: number;
}>;

const FIRST = 0;
const ONE = 1;
const TWO_OPTIONS = 2;
// Latin letters that pick the first and second of two day periods
const LATIN_FIRST = "a";
const LATIN_SECOND = "p";

function lower(text: string): string {
  return text.toLocaleLowerCase();
}

// The first index where the options stop sharing their start
function firstDifference(options: readonly string[]): number {
  const shortest = Math.min(...options.map((option) => option.length));
  const first = options[FIRST] ?? "";
  let index = FIRST;
  while (
    index < shortest &&
    options.every((option) => option.charAt(index) === first.charAt(index))
  ) {
    index += ONE;
  }
  return index;
}

// The one option `matches` holds, if exactly one does
function onlyOne(matches: readonly string[]): string | undefined {
  if (matches.length === ONE) {
    return matches[FIRST];
  }
  return undefined;
}

function latinPick(
  options: readonly string[],
  char: string
): string | undefined {
  if (options.length !== TWO_OPTIONS) {
    return undefined;
  }
  if (lower(char) === LATIN_FIRST) {
    return options[FIRST];
  }
  if (lower(char) === LATIN_SECOND) {
    return options[ONE];
  }
  return undefined;
}

/**
 * The option a typed character picks: the only one it starts, else the
 * only one whose first differing character it is (午後 for 後), else for two
 * options `a` or `p`.
 *
 * @param options - The choice's options
 * @param char - The typed character
 * @returns The option, or undefined when the character picks none
 */
function optionFor(
  options: readonly string[],
  char: string
): string | undefined {
  const typed = lower(char);
  const starting = onlyOne(
    options.filter((option) => lower(option).startsWith(typed))
  );
  if (starting !== undefined) {
    return starting;
  }
  const index = firstDifference(options);
  const differing = onlyOne(
    options.filter((option) => lower(option.charAt(index)) === typed)
  );
  if (differing !== undefined) {
    return differing;
  }
  return latinPick(options, char);
}

function isChoice(token: MaskToken | undefined): token is ChoiceToken {
  return token !== undefined && token.kind === "choice";
}

/**
 * The choice holding `position`, if a choice does.
 *
 * @param mask - The mask
 * @param position - A text position
 * @returns Where the choice sits, or undefined
 */
function choiceAt(mask: Mask, position: number): ChoiceSpan | undefined {
  const token = mask.tokens[position];
  if (!isChoice(token)) {
    return undefined;
  }
  const from = position - token.offset;
  const width = paddedOption(token.options, "").length;
  return { from, options: token.options, to: from + width };
}

/**
 * Write the option `char` picks over the whole choice.
 *
 * @param buffer - The field's buffer
 * @param span - The choice
 * @param char - The typed character
 * @returns The buffer with the option written, or undefined when none fits
 */
function writeChoice(
  buffer: TextBuffer,
  span: ChoiceSpan,
  char: string
): TextBuffer | undefined {
  const option = optionFor(span.options, char);
  if (option === undefined) {
    return undefined;
  }
  return replaceRange(
    buffer,
    { from: span.from, to: span.to },
    paddedOption(span.options, option)
  );
}

/**
 * Empty the whole choice.
 *
 * @param buffer - The field's buffer
 * @param mask - The mask, for its placeholder
 * @param span - The choice
 * @returns The buffer with every position of the choice empty
 */
function clearChoice(
  buffer: TextBuffer,
  mask: Mask,
  span: ChoiceSpan
): TextBuffer {
  return replaceRange(
    buffer,
    { from: span.from, to: span.to },
    mask.placeholder.repeat(span.to - span.from)
  );
}

/**
 * The text a choice shows for `value` written in template form: the
 * option, if the value holds one at the choice's place.
 *
 * @param span - The choice
 * @param value - A value as long as the template
 * @returns The choice's text, or undefined when the value holds no option
 */
function choiceIn(span: ChoiceSpan, value: string): string | undefined {
  const written = value.slice(span.from, span.to);
  return span.options
    .map((option) => paddedOption(span.options, option))
    .find((option) => option === written);
}

export { choiceAt, choiceIn, clearChoice, writeChoice };
export type { ChoiceSpan };
