// Copies of segments that keep what an hour or day period needs to be read

import type { Segment, SegmentMeta } from "./types";

/**
 * The hour cycle and day period texts of `source`, holding only the fields
 * it has, so a segment without them stays without them.
 *
 * @param source - A segment or format token
 * @returns The fields to copy
 */
function metaOf(source: SegmentMeta): SegmentMeta {
  const meta: {
    hourCycle?: SegmentMeta["hourCycle"];
    options?: SegmentMeta["options"];
  } = {};
  if (source.hourCycle !== undefined) {
    meta.hourCycle = source.hourCycle;
  }
  if (source.options !== undefined) {
    meta.options = source.options;
  }
  return meta;
}

/**
 * A segment of `source`'s type, place and meta with a new value.
 *
 * @param source - The segment, or the format token it is built from
 * @param segment - Type, place and value of the new segment
 * @returns The segment
 */
function withMeta(source: SegmentMeta, segment: Segment): Segment {
  return Object.assign(segment, metaOf(source));
}

/**
 * `seg` with another value.
 *
 * @param seg - The segment
 * @param value - Its new value
 * @returns The segment with the value
 */
function valued(seg: Segment, value: string): Segment {
  return withMeta(seg, {
    end: seg.end,
    start: seg.start,
    type: seg.type,
    value,
  });
}

export { valued, withMeta };
