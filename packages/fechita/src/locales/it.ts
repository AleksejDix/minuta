// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `it` from Unicode CLDR 48.2.0. */
const it: LocaleData = {
  dayPeriods: {
    am: ["AM", "m."],
    flexible: [
      {
        before: 18,
        from: 12,
        names: ["di pomeriggio", "del pomeriggio", "pomeriggio"],
      },
      { before: 24, from: 18, names: ["di sera", "sera"] },
      { before: 1, from: 0, names: ["mezzanotte"] },
      { before: 12, from: 6, names: ["di mattina", "mattina"] },
      { before: 6, from: 0, names: ["di notte", "notte"] },
      { before: 13, from: 12, names: ["mezzogiorno"] },
    ],
    pm: ["PM", "p."],
  },
  eras: {
    ad: ["dopo Cristo", "d.C.", "E.V."],
    bc: ["avanti Cristo", "a.C.", "a.E.V."],
  },
  months: [
    ["gennaio", "gen"],
    ["febbraio", "feb"],
    ["marzo", "mar"],
    ["aprile", "apr"],
    ["maggio", "mag"],
    ["giugno", "giu"],
    ["luglio", "lug"],
    ["agosto", "ago"],
    ["settembre", "set"],
    ["ottobre", "ott"],
    ["novembre", "nov"],
    ["dicembre", "dic"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "it",
  weekdays: [
    ["domenica", "dom"],
    ["lunedì", "lun"],
    ["martedì", "mar"],
    ["mercoledì", "mer"],
    ["giovedì", "gio"],
    ["venerdì", "ven"],
    ["sabato", "sab"],
  ],
};

export { it };
