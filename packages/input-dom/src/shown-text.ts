const ASCII_DIGIT = /\d/gu;

/**
 * The text as shown: ASCII digits replaced by `digits`, one character each,
 * so positions in the element and in the state stay the same.
 *
 * @param text - Text of the state
 * @param digits - Digits for 0–9, if any
 * @returns The text to show
 */
function shownText(
  text: string,
  digits: readonly string[] | undefined
): string {
  if (digits === undefined) {
    return text;
  }
  return text.replaceAll(
    ASCII_DIGIT,
    (digit) => digits[Number(digit)] ?? digit
  );
}

export { shownText };
