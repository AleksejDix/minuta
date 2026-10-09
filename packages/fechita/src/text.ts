/**
 * Forgiving text: digits of every script become ASCII, words are compared
 * without case, accents and dots, so "MÄRZ", "Marz" and "märz." all match.
 */

const DIGITS_PER_SET = 10;
const ONE = 1;
const FIRST = 0;
const NO_CODE_POINT = 0;

const DECIMAL_DIGIT = /^\p{Nd}$/u;
const ANY_DECIMAL_DIGIT = /\p{Nd}/gu;
// Accents of Latin, Greek and Cyrillic letters. Marks of other scripts are
// Letters in their own right (the Thai vowel of "มี.ค." tells March from January)
const COMBINING_MARK =
  /(?<=[\p{sc=Latin}\p{sc=Greek}\p{sc=Cyrillic}]\p{M}*)\p{M}/gu;
// Dots and the Devanagari abbreviation sign: "Jan.", "फ़र॰"
const DOTS = /[.॰]/gu;
const SPACES = /\s+/gu;
const HAS_DIGIT = /\d/u;

/**
 * The ASCII digit with the value of a decimal digit of any script. Unicode
 * keeps every set of decimal digits as ten consecutive code points from 0
 * to 9, so the value is the number of digits before it, modulo ten.
 *
 * @param digit - One `\p{Nd}` character
 * @returns The ASCII digit
 */
function asciiDigit(digit: string): string {
  const codePoint = digit.codePointAt(FIRST) ?? NO_CODE_POINT;
  let before = 0;
  while (DECIMAL_DIGIT.test(String.fromCodePoint(codePoint - before - ONE))) {
    before += ONE;
  }
  return String(before % DIGITS_PER_SET);
}

/**
 * The text with full-width forms folded (NFKC) and every decimal digit as
 * ASCII.
 *
 * @param text - Input text
 * @returns The normalised text
 */
function normalized(text: string): string {
  return text
    .normalize("NFKC")
    .replaceAll(ANY_DECIMAL_DIGIT, (digit) => asciiDigit(digit))
    .trim();
}

/**
 * The key a word is compared by: lowercase, without accents, dots or
 * repeated spaces.
 *
 * @param word - A word or name
 * @returns The comparison key
 */
function wordKey(word: string): string {
  return (
    word
      .normalize("NFKD")
      .replaceAll(COMBINING_MARK, "")
      // Recompose, so a Hangul syllable stays one character
      .normalize("NFC")
      .toLowerCase()
      .replaceAll(DOTS, "")
      .replaceAll(SPACES, " ")
      .trim()
  );
}

/**
 * Whether a name can be matched as a word: names written with digits (the
 * "3月" of Japanese) are read as numbers instead.
 *
 * @param key - A word key
 * @returns Whether to index the name
 */
function isWord(key: string): boolean {
  return key.length > FIRST && !HAS_DIGIT.test(key);
}

export { isWord, normalized, wordKey };
