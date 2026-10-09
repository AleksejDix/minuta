// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `lv` from Unicode CLDR 48.2.0. */
const lv: LocaleData = {
  dayPeriods: {
    am: ["priekšp.", "priekšpusdienā", "priekšpusdiena"],
    flexible: [
      {
        before: 18,
        from: 12,
        names: ["pēcpusd.", "pēcpusdienā", "pēcpusdiena"],
      },
      { before: 23, from: 18, names: ["vakarā", "vakars"] },
      { before: 1, from: 0, names: ["pusnaktī", "pusnakts"] },
      { before: 12, from: 6, names: ["no rīta", "rīts"] },
      { before: 6, from: 23, names: ["naktī", "nakts"] },
      {
        before: 13,
        from: 12,
        names: ["pusd.", "pusdienlaikā", "pusdienlaiks"],
      },
    ],
    pm: ["pēcp.", "pēcpusdienā", "pēcpusd.", "pēcpusdiena"],
  },
  eras: { ad: ["mūsu ērā", "m.ē."], bc: ["pirms mūsu ēras", "p.m.ē."] },
  months: [
    ["janvāris", "janv."],
    ["februāris", "febr."],
    ["marts"],
    ["aprīlis", "apr."],
    ["maijs"],
    ["jūnijs", "jūn."],
    ["jūlijs", "jūl."],
    ["augusts", "aug."],
    ["septembris", "sept."],
    ["oktobris", "okt."],
    ["novembris", "nov."],
    ["decembris", "dec."],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "lv",
  weekdays: [
    ["svētdiena", "svētd.", "Sv", "Svētdiena", "Svētd."],
    ["pirmdiena", "pirmd.", "Pr", "Pirmdiena", "Pirmd."],
    ["otrdiena", "otrd.", "Ot", "Otrdiena", "Otrd."],
    ["trešdiena", "trešd.", "Tr", "Trešdiena", "Trešd."],
    ["ceturtdiena", "ceturtd.", "Ce", "Ceturtdiena", "Ceturtd."],
    ["piektdiena", "piektd.", "Pk", "Piektdiena", "Piektd."],
    ["sestdiena", "sestd.", "Se", "Sestdiena", "Sestd."],
  ],
};

export { lv };
