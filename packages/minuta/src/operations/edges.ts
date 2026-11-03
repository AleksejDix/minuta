/**
 * Comparing the edges of periods: the earlier and the later of two values
 * of one kind.
 */

import type { PlainDate, ZonedDateTime } from "#src/types";
import { compare } from "#src/values";

const EQUAL = 0;

type Value = PlainDate | ZonedDateTime;

/**
 * The earlier of two values of one kind.
 *
 * @param left - One value
 * @param right - The other value
 * @returns The earlier one, `left` when they are equal
 */
function earlierOf<Kind extends Value>(left: Kind, right: Kind): Kind {
  if (compare(right, left) < EQUAL) {
    return right;
  }
  return left;
}

/**
 * The later of two values of one kind.
 *
 * @param left - One value
 * @param right - The other value
 * @returns The later one, `left` when they are equal
 */
function laterOf<Kind extends Value>(left: Kind, right: Kind): Kind {
  if (compare(right, left) > EQUAL) {
    return right;
  }
  return left;
}

export { earlierOf, laterOf };
