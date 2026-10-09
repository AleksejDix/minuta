// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `eu` from Unicode CLDR 48.2.0. */
const eu: LocaleData = {
  dayPeriods: {
    am: ["AM", "g"],
    flexible: [
      { before: 14, from: 12, names: ["eguerd.", "eguerdiko", "eguerdia"] },
      {
        before: 19,
        from: 14,
        names: ["arrats.", "arratsaldeko", "arratsaldea"],
      },
      { before: 21, from: 19, names: ["iluntz.", "iluntzeko", "iluntzea"] },
      { before: 1, from: 0, names: ["gauerdia", "gauerd."] },
      {
        before: 6,
        from: 0,
        names: ["goizald.", "goizaldeko", "goiz.", "goizaldea"],
      },
      { before: 12, from: 6, names: ["goizeko", "goiza"] },
      { before: 24, from: 21, names: ["gaueko", "gaua"] },
    ],
    pm: ["PM", "a"],
  },
  eras: {
    ad: ["Kristo ondoren", "K.o.", "o.a."],
    bc: ["Kristo aurretik", "K.a.", "o.a.a."],
  },
  months: [
    ["urtarrila", "urt."],
    ["otsaila", "ots."],
    ["martxoa", "mar."],
    ["apirila", "api."],
    ["maiatza", "mai."],
    ["ekaina", "eka."],
    ["uztaila", "uzt."],
    ["abuztua", "abu."],
    ["iraila", "ira."],
    ["urria", "urr."],
    ["azaroa", "aza."],
    ["abendua", "abe."],
  ],
  order: "YMD",
  regionOrders: {},
  tag: "eu",
  weekdays: [
    ["igandea", "ig."],
    ["astelehena", "al."],
    ["asteartea", "ar."],
    ["asteazkena", "az."],
    ["osteguna", "og."],
    ["ostirala", "or."],
    ["larunbata", "lr."],
  ],
};

export { eu };
