// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `sr-Latn` from Unicode CLDR 48.2.0. */
const srLatn: LocaleData = {
  dayPeriods: {
    am: ["AM"],
    flexible: [
      { before: 18, from: 12, names: ["po podne", "popodne"] },
      { before: 21, from: 18, names: ["uveče", "veče"] },
      { before: 1, from: 0, names: ["ponoć"] },
      { before: 12, from: 6, names: ["ujutru", "jutro"] },
      { before: 6, from: 21, names: ["noću", "noć"] },
      { before: 13, from: 12, names: ["podne"] },
    ],
    pm: ["PM"],
  },
  eras: { ad: ["nove ere", "n. e."], bc: ["pre nove ere", "p. n. e."] },
  months: [
    ["januar", "jan"],
    ["februar", "feb"],
    ["mart", "mar"],
    ["april", "apr"],
    ["maj"],
    ["jun"],
    ["jul"],
    ["avgust", "avg"],
    ["septembar", "sep"],
    ["oktobar", "okt"],
    ["novembar", "nov"],
    ["decembar", "dec"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "sr-Latn",
  weekdays: [
    ["nedelja", "ned", "ne"],
    ["ponedeljak", "pon", "po"],
    ["utorak", "uto", "ut"],
    ["sreda", "sre", "sr"],
    ["četvrtak", "čet", "če"],
    ["petak", "pet", "pe"],
    ["subota", "sub", "su"],
  ],
};

export { srLatn };
