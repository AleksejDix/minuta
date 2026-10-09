// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `nn` from Unicode CLDR 48.2.0. */
const nn: LocaleData = {
  dayPeriods: {
    am: ["f.m.", "a"],
    flexible: [
      {
        before: 18,
        from: 12,
        names: ["etterm.", "på ettermiddagen", "em.", "ettermiddag"],
      },
      { before: 24, from: 18, names: ["kveld", "på kvelden", "kv."] },
      { before: 1, from: 0, names: ["midn.", "midnatt", "mn."] },
      { before: 10, from: 6, names: ["morg.", "på morgonen", "mg.", "morgon"] },
      {
        before: 12,
        from: 10,
        names: ["form.", "på formiddagen", "fm.", "formiddag"],
      },
      { before: 6, from: 0, names: ["natt", "på natta", "nt."] },
    ],
    pm: ["e.m.", "p"],
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
  tag: "nn",
  weekdays: [
    ["søndag", "sø.", "søn"],
    ["måndag", "må.", "mån"],
    ["tysdag", "ty.", "tys"],
    ["onsdag", "on.", "ons"],
    ["torsdag", "to.", "tor"],
    ["fredag", "fr.", "fre"],
    ["laurdag", "la.", "lau"],
  ],
};

export { nn };
