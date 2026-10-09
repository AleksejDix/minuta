// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `is` from Unicode CLDR 48.2.0. */
const is: LocaleData = {
  dayPeriods: {
    am: ["f.h.", "f."],
    flexible: [
      { before: 18, from: 12, names: ["síðdegis", "sd.", "eftir hádegi"] },
      { before: 24, from: 18, names: ["að kvöldi", "kv.", "kvöld"] },
      { before: 1, from: 0, names: ["miðnætti", "mn."] },
      { before: 12, from: 6, names: ["að morgni", "mrg.", "morgunn"] },
      { before: 6, from: 0, names: ["að nóttu", "n.", "nótt"] },
      { before: 13, from: 12, names: ["hádegi", "h.", "hd."] },
    ],
    pm: ["e.h.", "e."],
  },
  eras: {
    ad: ["eftir Krist", "e.Kr.", "l.t."],
    bc: ["fyrir Krist", "f.Kr.", "f.l.t."],
  },
  months: [
    ["janúar", "jan."],
    ["febrúar", "feb."],
    ["mars", "mar."],
    ["apríl", "apr."],
    ["maí"],
    ["júní", "jún."],
    ["júlí", "júl."],
    ["ágúst", "ágú."],
    ["september", "sep."],
    ["október", "okt."],
    ["nóvember", "nóv."],
    ["desember", "des."],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "is",
  weekdays: [
    ["sunnudagur", "sun.", "su."],
    ["mánudagur", "mán.", "má."],
    ["þriðjudagur", "þri.", "þr."],
    ["miðvikudagur", "mið.", "mi."],
    ["fimmtudagur", "fim.", "fi."],
    ["föstudagur", "fös.", "fö."],
    ["laugardagur", "lau.", "la."],
  ],
};

export { is };
