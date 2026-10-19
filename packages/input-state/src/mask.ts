/**
 * Masks: a fixed sequence of literal characters and typed slots.
 *
 * Pattern syntax: `9` digit, `A` letter, `*` letter or digit, `\x` literal x,
 * anything else is a literal. A choice (such as AM/PM) holds one of a few
 * fixed texts; build its tokens with `choiceTokens`. Masks are plain data and
 * survive JSON.
 */

const DEFAULT_PLACEHOLDER = "_";
const ESCAPE = "\\";

type CharClass = "alphanumeric" | "digit" | "letter";

type MaskToken =
  | Readonly<{ char: string; kind: "literal" }>
  | Readonly<{ accepts: CharClass; kind: "slot" }>
  /** One position of a choice; `offset` counts from the choice's first */
  | Readonly<{ kind: "choice"; offset: number; options: readonly string[] }>;

type Mask = Readonly<{
  placeholder: string;
  tokens: readonly MaskToken[];
}>;

const PATTERN_CLASSES: ReadonlyMap<string, CharClass> = new Map([
  ["*", "alphanumeric"],
  ["9", "digit"],
  ["A", "letter"],
]);

const CLASS_TESTS: Readonly<Record<CharClass, RegExp>> = {
  alphanumeric: /^[\p{L}\p{Nd}]$/u,
  digit: /^\p{Nd}$/u,
  letter: /^\p{L}$/u,
};

function tokenFor(char: string, escaped: boolean): MaskToken {
  const charClass = PATTERN_CLASSES.get(char);
  if (escaped || charClass === undefined) {
    return { char, kind: "literal" };
  }
  return { accepts: charClass, kind: "slot" };
}

/**
 * Parse a mask pattern such as `99.99.9999`.
 *
 * @param pattern - Mask pattern (`9` digit, `A` letter, `*` alphanumeric, `\x` literal)
 * @param placeholder - Character shown in empty slots
 * @returns The mask
 */
function parseMask(
  pattern: string,
  placeholder: string = DEFAULT_PLACEHOLDER
): Mask {
  const tokens: MaskToken[] = [];
  let escaped = false;
  for (const char of pattern) {
    if (char === ESCAPE && !escaped) {
      escaped = true;
    } else {
      tokens.push(tokenFor(char, escaped));
      escaped = false;
    }
  }
  return { placeholder, tokens };
}

// Fills a shorter option to the choice's width
const CHOICE_PAD = "\u00A0";

/**
 * The tokens of a choice between fixed texts, one per character of the
 * longest: `["AM", "PM"]` takes two positions. Shorter options are padded
 * with a no-break space. Typing a character picks the option it starts, or
 * the one whose first differing character it is.
 *
 * @example
 * const time = parseMask("99:99 ");
 * const mask = { ...time, tokens: [...time.tokens, ...choiceTokens(["AM", "PM"])] };
 *
 * @param options - The texts to choose from, in order
 * @returns One token per position
 */
function choiceTokens(options: readonly string[]): MaskToken[] {
  const width = Math.max(...options.map((option) => option.length));
  return Array.from({ length: width }, (_unused, offset) => ({
    kind: "choice",
    offset,
    options,
  }));
}

/**
 * An option as the choice shows it: padded to the width of the longest.
 *
 * @param options - The choice's options
 * @param option - One of them
 * @returns The option's text, as wide as the choice
 */
function paddedOption(options: readonly string[], option: string): string {
  const width = Math.max(...options.map((each) => each.length));
  return option.padEnd(width, CHOICE_PAD);
}

/**
 * Text of a mask with every slot empty, e.g. `__.__.____`.
 *
 * @param mask - Mask to render
 * @returns The empty template
 */
function emptyText(mask: Mask): string {
  return mask.tokens
    .map((token) => {
      if (token.kind === "literal") {
        return token.char;
      }
      return mask.placeholder;
    })
    .join("");
}

/**
 * Text positions of all slots, choices included, in order.
 *
 * @param mask - Mask to inspect
 * @returns Slot positions
 */
function slotPositions(mask: Mask): number[] {
  const positions: number[] = [];
  for (const [position, token] of mask.tokens.entries()) {
    if (token.kind !== "literal") {
      positions.push(position);
    }
  }
  return positions;
}

/**
 * Whether `char` is exactly one character of the given class.
 *
 * @param charClass - Class to test against
 * @param char - Candidate character
 * @returns Whether the character is accepted
 */
function accepts(charClass: CharClass, char: string): boolean {
  return CLASS_TESTS[charClass].test(char);
}

const DIGITS_PER_SET = 10;
const ONE = 1;
const FIRST = 0;
const NO_CODE_POINT = 0;

/**
 * The ASCII digit with the value of a decimal digit of any script. Unicode
 * keeps every set of decimal digits as ten consecutive code points from 0
 * to 9, so the value is the count of digits before it, modulo ten.
 *
 * @param digit - One `\p{Nd}` character, e.g. "٣" or "３"
 * @returns The ASCII digit, e.g. "3"
 */
function asciiDigit(digit: string): string {
  const codePoint = digit.codePointAt(FIRST) ?? NO_CODE_POINT;
  let before = 0;
  while (
    CLASS_TESTS.digit.test(String.fromCodePoint(codePoint - before - ONE))
  ) {
    before += ONE;
  }
  return String(before % DIGITS_PER_SET);
}

/**
 * The character a slot of `charClass` stores for `char`: decimal digits of
 * any script become ASCII, so what is shown is what parses; letters outside
 * the Basic Multilingual Plane do not fit one slot and are rejected.
 *
 * @param charClass - Class of the slot
 * @param char - Candidate character
 * @returns The character to store, or undefined when the slot rejects it
 */
function slotChar(charClass: CharClass, char: string): string | undefined {
  if (!accepts(charClass, char)) {
    return undefined;
  }
  if (CLASS_TESTS.digit.test(char)) {
    return asciiDigit(char);
  }
  // A slot holds one UTF-16 unit; a letter outside the BMP would need two
  if (char.length !== ONE) {
    return undefined;
  }
  return char;
}

export {
  accepts,
  choiceTokens,
  emptyText,
  paddedOption,
  parseMask,
  slotChar,
  slotPositions,
};
export type { CharClass, Mask, MaskToken };
