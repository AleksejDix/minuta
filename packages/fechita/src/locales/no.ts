// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `no` from Unicode CLDR 48.2.0. */
const no: LocaleData = {
  dayPeriods: {
    am: ["a.m.", "a"],
    flexible: [
      {
        before: 18,
        from: 12,
        names: ["etterm.", "på ettermiddagen", "em.", "ettermiddag"],
      },
      { before: 24, from: 18, names: ["kveld", "på kvelden", "kv."] },
      { before: 1, from: 0, names: ["midn.", "midnatt", "mn."] },
      { before: 10, from: 6, names: ["morg.", "på morgenen", "mg.", "morgen"] },
      {
        before: 12,
        from: 10,
        names: ["form.", "på formiddagen", "fm.", "formiddag"],
      },
      { before: 6, from: 0, names: ["natt", "på natten", "nt."] },
    ],
    pm: ["p.m.", "p"],
  },
  eras: {
    ad: ["etter Kristus", "e.Kr.", "evt."],
    bc: ["før Kristus", "f.Kr.", "fvt."],
  },
  months: [
    ["januar", "jan.", "jan"],
    ["februar", "feb.", "feb"],
    ["mars", "mar"],
    ["april", "apr.", "apr"],
    ["mai"],
    ["juni", "jun"],
    ["juli", "jul"],
    ["august", "aug.", "aug"],
    ["september", "sep.", "sep"],
    ["oktober", "okt.", "okt"],
    ["november", "nov.", "nov"],
    ["desember", "des.", "des"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "no",
  weekdays: [
    ["søndag", "søn.", "sø."],
    ["mandag", "man.", "ma."],
    ["tirsdag", "tir.", "ti."],
    ["onsdag", "ons.", "on."],
    ["torsdag", "tor.", "to."],
    ["fredag", "fre.", "fr."],
    ["lørdag", "lør.", "lø."],
  ],
};

export { no };
