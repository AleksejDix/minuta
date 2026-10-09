// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `sl` from Unicode CLDR 48.2.0. */
const sl: LocaleData = {
  dayPeriods: {
    am: ["dop.", "d", "dopoldne"],
    flexible: [
      { before: 18, from: 12, names: ["pop.", "popoldan", "p", "popoldne"] },
      {
        before: 22,
        from: 18,
        names: ["zveč.", "zvečer", "zv", "več.", "večer", "v"],
      },
      {
        before: 1,
        from: 0,
        names: ["opoln.", "opolnoči", "24.00", "poln.", "polnoč"],
      },
      {
        before: 10,
        from: 6,
        names: ["zjut.", "zjutraj", "zj", "jut.", "jutro", "j"],
      },
      { before: 12, from: 10, names: ["dop.", "dopoldan", "d", "dopoldne"] },
      { before: 6, from: 22, names: ["ponoči", "po", "noč", "n"] },
      {
        before: 13,
        from: 12,
        names: ["opold.", "opoldne", "12.00", "pold.", "poldne"],
      },
    ],
    pm: ["pop.", "p", "popoldne"],
  },
  eras: {
    ad: ["po Kristusu", "po Kr.", "po n. št."],
    bc: ["pred Kristusom", "pr. Kr.", "pr. n. št."],
  },
  months: [
    ["januar", "jan."],
    ["februar", "feb."],
    ["marec", "mar."],
    ["april", "apr."],
    ["maj"],
    ["junij", "jun."],
    ["julij", "jul."],
    ["avgust", "avg."],
    ["september", "sep."],
    ["oktober", "okt."],
    ["november", "nov."],
    ["december", "dec."],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "sl",
  weekdays: [
    ["nedelja", "ned."],
    ["ponedeljek", "pon."],
    ["torek", "tor."],
    ["sreda", "sre."],
    ["četrtek", "čet."],
    ["petek", "pet."],
    ["sobota", "sob."],
  ],
};

export { sl };
