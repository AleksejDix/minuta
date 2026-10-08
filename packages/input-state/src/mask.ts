/**
 * Masks: a fixed sequence of literal characters and typed slots.
 *
 * Pattern syntax: `9` digit, `A` letter, `*` letter or digit, `\x` literal x,
 * anything else is a literal. Masks are plain data and survive JSON.
 */

const DEFAULT_PLACEHOLDER = "_";
const ESCAPE = "\\";

type CharClass = "alphanumeric" | "digit" | "letter";

type MaskToken =
  | Readonly<{ char: string; kind: "literal" }>
  | Readonly<{ accepts: CharClass; kind: "slot" }>;

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
 * Text positions of all slots, in order.
 *
 * @param mask - Mask to inspect
 * @returns Slot positions
 */
function slotPositions(mask: Mask): number[] {
  const positions: number[] = [];
  for (const [position, token] of mask.tokens.entries()) {
    if (token.kind === "slot") {
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

export { accepts, emptyText, parseMask, slotPositions };
export type { CharClass, Mask, MaskToken };
