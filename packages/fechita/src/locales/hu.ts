// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `hu` from Unicode CLDR 48.2.0. */
const hu: LocaleData = {
  dayPeriods: {
    am: ["de."],
    flexible: [
      { before: 18, from: 12, names: ["du.", "délután"] },
      { before: 21, from: 18, names: ["este"] },
      { before: 1, from: 0, names: ["éjfél"] },
      { before: 9, from: 6, names: ["reggel"] },
      { before: 12, from: 9, names: ["de.", "délelőtt"] },
      { before: 4, from: 21, names: ["éjjel"] },
      { before: 6, from: 4, names: ["hajnal"] },
      { before: 13, from: 12, names: ["dél"] },
    ],
    pm: ["du."],
  },
  eras: {
    ad: ["időszámításunk szerint", "i. sz.", "i.sz."],
    bc: ["Krisztus előtt", "i. e.", "i.e."],
  },
  months: [
    ["január", "jan."],
    ["február", "febr."],
    ["március", "márc."],
    ["április", "ápr."],
    ["május", "máj."],
    ["június", "jún."],
    ["július", "júl."],
    ["augusztus", "aug."],
    ["szeptember", "szept."],
    ["október", "okt."],
    ["november", "nov."],
    ["december", "dec."],
  ],
  order: "YMD",
  regionOrders: {},
  tag: "hu",
  weekdays: [
    ["vasárnap", "V"],
    ["hétfő", "H"],
    ["kedd", "K"],
    ["szerda", "Sze"],
    ["csütörtök", "Cs"],
    ["péntek", "P"],
    ["szombat", "Szo"],
  ],
};

export { hu };
