/**
 * The first match of a global regular expression, or undefined: avoids the
 * `null` of `RegExp#exec`.
 *
 * @param text - Text to search
 * @param pattern - A regular expression with the `g` flag
 * @returns The first match, or undefined
 */
function firstMatch(
  text: string,
  pattern: Readonly<RegExp>
): RegExpExecArray | undefined {
  const [match] = text.matchAll(pattern);
  return match;
}

/**
 * The named groups of the first match, or undefined without a match.
 *
 * @param text - Text to search
 * @param pattern - A regular expression with the `g` flag and named groups
 * @returns The groups, or undefined
 */
function groupsOf(
  text: string,
  pattern: Readonly<RegExp>
): Readonly<Record<string, string | undefined>> | undefined {
  const match = firstMatch(text, pattern);
  if (match === undefined) {
    return undefined;
  }
  return match.groups ?? {};
}

export { firstMatch, groupsOf };
