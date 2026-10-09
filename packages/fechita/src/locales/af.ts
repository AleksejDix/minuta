// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `af` from Unicode CLDR 48.2.0. */
const af: LocaleData = {
  dayPeriods: {
    am: ["vm.", "v"],
    flexible: [
      {
        before: 18,
        from: 12,
        names: ["die middag", "in die middag", "middag"],
      },
      { before: 24, from: 18, names: ["die aand", "in die aand", "aand"] },
      { before: 1, from: 0, names: ["middernag", "mn"] },
      { before: 12, from: 5, names: ["die oggend", "oggend"] },
      { before: 5, from: 0, names: ["die nag", "in die nag", "nag"] },
    ],
    pm: ["nm.", "n"],
  },
  eras: {
    ad: ["ná Christus", "n.C.", "g.j."],
    bc: ["voor Christus", "v.C.", "v.g.j."],
  },
  months: [
    ["Januarie", "Jan."],
    ["Februarie", "Feb."],
    ["Maart", "Mrt."],
    ["April", "Apr."],
    ["Mei"],
    ["Junie", "Jun."],
    ["Julie", "Jul."],
    ["Augustus", "Aug."],
    ["September", "Sep."],
    ["Oktober", "Okt."],
    ["November", "Nov."],
    ["Desember", "Des."],
  ],
  order: "YMD",
  regionOrders: {},
  tag: "af",
  weekdays: [
    ["Sondag", "So."],
    ["Maandag", "Ma."],
    ["Dinsdag", "Di."],
    ["Woensdag", "Wo."],
    ["Donderdag", "Do."],
    ["Vrydag", "Vr."],
    ["Saterdag", "Sa."],
  ],
};

export { af };
