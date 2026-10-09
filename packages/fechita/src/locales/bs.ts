// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `bs` from Unicode CLDR 48.2.0. */
const bs: LocaleData = {
  dayPeriods: {
    am: ["a. m.", "prijepodne"],
    flexible: [
      { before: 18, from: 12, names: ["poslijepodne"] },
      { before: 21, from: 18, names: ["navečer"] },
      { before: 1, from: 0, names: ["ponoć"] },
      { before: 12, from: 4, names: ["ujutro"] },
      { before: 4, from: 21, names: ["po noći"] },
      { before: 13, from: 12, names: ["podne"] },
    ],
    pm: ["p. m.", "popodne"],
  },
  eras: { ad: ["nove ere", "n. e."], bc: ["prije nove ere", "p. n. e."] },
  months: [
    ["januar", "jan"],
    ["februar", "feb"],
    ["mart", "mar"],
    ["april", "apr"],
    ["maj"],
    ["juni", "jun"],
    ["juli", "jul"],
    ["august", "aug"],
    ["septembar", "sep"],
    ["oktobar", "okt"],
    ["novembar", "nov"],
    ["decembar", "dec"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "bs",
  weekdays: [
    ["nedjelja", "ned"],
    ["ponedjeljak", "pon"],
    ["utorak", "uto"],
    ["srijeda", "sri"],
    ["četvrtak", "čet"],
    ["petak", "pet"],
    ["subota", "sub"],
  ],
};

export { bs };
