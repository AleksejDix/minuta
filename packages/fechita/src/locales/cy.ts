// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `cy` from Unicode CLDR 48.2.0. */
const cy: LocaleData = {
  dayPeriods: {
    am: ["AM", "yb", "b"],
    flexible: [
      {
        before: 18,
        from: 12,
        names: ["y prynhawn", "yn y prynhawn", "prynhawn"],
      },
      { before: 24, from: 18, names: ["yr hwyr", "min nos"] },
      { before: 1, from: 0, names: ["canol nos"] },
      { before: 12, from: 0, names: ["y bore", "yn y bore", "bore"] },
      { before: 13, from: 12, names: ["canol dydd"] },
    ],
    pm: ["PM", "yh", "h"],
  },
  eras: { ad: ["Oed Crist", "OC", "CYCY"], bc: ["Cyn Crist", "CC", "CCC"] },
  months: [
    ["Ionawr", "Ion"],
    ["Chwefror", "Chwef", "Chw"],
    ["Mawrth", "Maw"],
    ["Ebrill", "Ebr"],
    ["Mai"],
    ["Mehefin", "Meh"],
    ["Gorffennaf", "Gorff", "Gor"],
    ["Awst"],
    ["Medi"],
    ["Hydref", "Hyd"],
    ["Tachwedd", "Tach"],
    ["Rhagfyr", "Rhag"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "cy",
  weekdays: [
    ["Dydd Sul", "Sul", "Su"],
    ["Dydd Llun", "Llun", "Ll"],
    ["Dydd Mawrth", "Maw", "Ma"],
    ["Dydd Mercher", "Mer", "Me"],
    ["Dydd Iau", "Iau", "Ia"],
    ["Dydd Gwener", "Gwen", "Gw", "Gwe"],
    ["Dydd Sadwrn", "Sad", "Sa"],
  ],
};

export { cy };
