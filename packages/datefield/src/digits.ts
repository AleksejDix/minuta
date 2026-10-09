const DIGIT_COUNT = 10;
const ONE_UNIT = 1;
const LATIN_DIGITS: readonly string[] = Array.from(
  { length: DIGIT_COUNT },
  (_unused, value) => String(value)
);

/**
 * The ten digits a locale writes numbers with, e.g. `٠`–`٩` for `ar-EG` or
 * `0`–`9` for `de-CH`. Fields store ASCII digits; pass these to the view
 * (input-dom's `digits` option) to show them the locale's way. Numbering
 * systems whose digits need two UTF-16 units (e.g. Adlam) fall back to
 * Latin digits, so text positions stay one slot per character.
 *
 * @example
 * localeDigits("ar-EG")[3]; // "٣"
 * localeDigits("de-CH")[3]; // "3"
 *
 * @param locale - BCP 47 locale, may carry `-u-nu-…`
 * @returns The digits for 0 to 9
 */
function localeDigits(locale: string): readonly string[] {
  const format = new Intl.NumberFormat(locale, { useGrouping: false });
  const digits = LATIN_DIGITS.map((_digit, value) => format.format(value));
  if (digits.every((digit) => digit.length === ONE_UNIT)) {
    return digits;
  }
  return LATIN_DIGITS;
}

export { localeDigits };
