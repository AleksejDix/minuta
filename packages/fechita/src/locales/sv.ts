// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `sv` from Unicode CLDR 48.2.0. */
const sv: LocaleData = {
  dayPeriods: {
    am: ["fm"],
    flexible: [
      {
        before: 18,
        from: 12,
        names: ["på efterm.", "på eftermiddagen", "efterm.", "eftermiddag"],
      },
      { before: 24, from: 18, names: ["på kvällen", "kväll"] },
      { before: 1, from: 0, names: ["midnatt", "midn."] },
      {
        before: 10,
        from: 5,
        names: ["på morg.", "på morgonen", "morgon", "morg."],
      },
      {
        before: 12,
        from: 10,
        names: ["på förm.", "på förmiddagen", "förm.", "förmiddag"],
      },
      { before: 5, from: 0, names: ["på natten", "natt"] },
    ],
    pm: ["em"],
  },
  eras: {
    ad: ["efter Kristus", "e.Kr.", "v.t."],
    bc: ["före Kristus", "f.Kr.", "f.v.t."],
  },
  months: [
    ["januari", "jan."],
    ["februari", "feb."],
    ["mars"],
    ["april", "apr."],
    ["maj"],
    ["juni"],
    ["juli"],
    ["augusti", "aug."],
    ["september", "sep."],
    ["oktober", "okt."],
    ["november", "nov."],
    ["december", "dec."],
  ],
  order: "YMD",
  regionOrders: { "sv-AX": "DMY", "sv-FI": "DMY" },
  tag: "sv",
  weekdays: [
    ["söndag", "sön", "sö"],
    ["måndag", "mån", "må"],
    ["tisdag", "tis", "ti"],
    ["onsdag", "ons", "on"],
    ["torsdag", "tors", "to"],
    ["fredag", "fre", "fr"],
    ["lördag", "lör", "lö"],
  ],
};

export { sv };
