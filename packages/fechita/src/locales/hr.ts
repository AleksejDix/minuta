// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `hr` from Unicode CLDR 48.2.0. */
const hr: LocaleData = {
  dayPeriods: {
    am: ["AM"],
    flexible: [
      { before: 18, from: 12, names: ["popodne", "poslije podne"] },
      { before: 21, from: 18, names: ["navečer"] },
      { before: 1, from: 0, names: ["ponoć"] },
      { before: 12, from: 4, names: ["ujutro"] },
      { before: 4, from: 21, names: ["noću"] },
      { before: 13, from: 12, names: ["podne"] },
    ],
    pm: ["PM"],
  },
  eras: {
    ad: ["poslije Krista", "po. Kr.", "n. e."],
    bc: ["prije Krista", "pr. Kr.", "pr. n. e."],
  },
  months: [
    ["siječnja", "sij", "siječanj"],
    ["veljače", "velj", "veljača"],
    ["ožujka", "ožu", "ožujak"],
    ["travnja", "tra", "travanj"],
    ["svibnja", "svi", "svibanj"],
    ["lipnja", "lip", "lipanj"],
    ["srpnja", "srp", "srpanj"],
    ["kolovoza", "kol", "kolovoz"],
    ["rujna", "ruj", "rujan"],
    ["listopada", "lis", "listopad"],
    ["studenoga", "stu", "studeni"],
    ["prosinca", "pro", "prosinac"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "hr",
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

export { hr };
