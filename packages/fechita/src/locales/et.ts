// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `et` from Unicode CLDR 48.2.0. */
const et: LocaleData = {
  dayPeriods: {
    am: ["AM"],
    flexible: [
      { before: 18, from: 12, names: ["pärastlõunal", "pärastlõuna"] },
      { before: 23, from: 18, names: ["õhtul", "õhtu"] },
      { before: 1, from: 0, names: ["keskööl", "kesköö"] },
      { before: 12, from: 5, names: ["hommikul", "hommik"] },
      { before: 5, from: 23, names: ["öösel", "öö"] },
      { before: 13, from: 12, names: ["keskpäeval", "keskpäev"] },
    ],
    pm: ["PM"],
  },
  eras: {
    ad: ["pärast Kristust", "pKr", "m.a.j"],
    bc: ["enne Kristust", "eKr", "e.m.a"],
  },
  months: [
    ["jaanuar", "jaan"],
    ["veebruar", "veebr"],
    ["märts"],
    ["aprill", "apr"],
    ["mai"],
    ["juuni"],
    ["juuli"],
    ["august", "aug"],
    ["september", "sept"],
    ["oktoober", "okt"],
    ["november", "nov"],
    ["detsember", "dets"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "et",
  weekdays: [
    ["pühapäev", "P"],
    ["esmaspäev", "E"],
    ["teisipäev", "T"],
    ["kolmapäev", "K"],
    ["neljapäev", "N"],
    ["reede", "R"],
    ["laupäev", "L"],
  ],
};

export { et };
