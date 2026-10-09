// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `nl` from Unicode CLDR 48.2.0. */
const nl: LocaleData = {
  dayPeriods: {
    am: ["a.m."],
    flexible: [
      { before: 18, from: 12, names: ["’s middags", "middag"] },
      { before: 24, from: 18, names: ["’s avonds", "avond"] },
      { before: 1, from: 0, names: ["middernacht"] },
      { before: 12, from: 6, names: ["’s ochtends", "ochtend"] },
      { before: 6, from: 0, names: ["’s nachts", "nacht"] },
    ],
    pm: ["p.m."],
  },
  eras: {
    ad: ["na Christus", "n.Chr.", "g.j."],
    bc: ["voor Christus", "v.Chr.", "v.g.j."],
  },
  months: [
    ["januari", "jan"],
    ["februari", "feb"],
    ["maart", "mrt"],
    ["april", "apr"],
    ["mei"],
    ["juni", "jun"],
    ["juli", "jul"],
    ["augustus", "aug"],
    ["september", "sep"],
    ["oktober", "okt"],
    ["november", "nov"],
    ["december", "dec"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "nl",
  weekdays: [
    ["zondag", "zo"],
    ["maandag", "ma"],
    ["dinsdag", "di"],
    ["woensdag", "wo"],
    ["donderdag", "do"],
    ["vrijdag", "vr"],
    ["zaterdag", "za"],
  ],
};

export { nl };
