// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `cs` from Unicode CLDR 48.2.0. */
const cs: LocaleData = {
  dayPeriods: {
    am: ["dop."],
    flexible: [
      { before: 18, from: 12, names: ["odp.", "odpoledne", "o."] },
      { before: 22, from: 18, names: ["več.", "večer", "v."] },
      { before: 1, from: 0, names: ["půln.", "půlnoc", "půl."] },
      { before: 9, from: 4, names: ["r.", "ráno"] },
      { before: 12, from: 9, names: ["dop.", "dopoledne", "d."] },
      { before: 4, from: 22, names: ["v n.", "v noci", "n.", "noc"] },
      { before: 13, from: 12, names: ["pol.", "poledne"] },
    ],
    pm: ["odp."],
  },
  eras: {
    ad: ["našeho letopočtu", "n. l."],
    bc: ["před naším letopočtem", "př. n. l."],
  },
  months: [
    ["ledna", "led", "leden"],
    ["února", "úno", "únor"],
    ["března", "bře", "březen"],
    ["dubna", "dub", "duben"],
    ["května", "kvě", "květen"],
    ["června", "čvn", "červen"],
    ["července", "čvc", "červenec"],
    ["srpna", "srp", "srpen"],
    ["září", "zář"],
    ["října", "říj", "říjen"],
    ["listopadu", "lis", "listopad"],
    ["prosince", "pro", "prosinec"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "cs",
  weekdays: [
    ["neděle", "ne"],
    ["pondělí", "po"],
    ["úterý", "út"],
    ["středa", "st"],
    ["čtvrtek", "čt"],
    ["pátek", "pá"],
    ["sobota", "so"],
  ],
};

export { cs };
