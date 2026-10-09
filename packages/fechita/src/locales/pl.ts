// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `pl` from Unicode CLDR 48.2.0. */
const pl: LocaleData = {
  dayPeriods: {
    am: ["AM", "a"],
    flexible: [
      {
        before: 18,
        from: 12,
        names: ["po południu", "po poł.", "popołudnie", "popoł."],
      },
      { before: 21, from: 18, names: ["wieczorem", "wiecz.", "wieczór"] },
      {
        before: 1,
        from: 0,
        names: ["o północy", "o półn.", "północ", "półn."],
      },
      { before: 10, from: 6, names: ["rano"] },
      {
        before: 12,
        from: 10,
        names: ["przed południem", "przed poł.", "przedpołudnie", "przedpoł."],
      },
      { before: 6, from: 21, names: ["w nocy", "noc"] },
      {
        before: 13,
        from: 12,
        names: ["w południe", "w poł.", "południe", "poł."],
      },
    ],
    pm: ["PM", "p"],
  },
  eras: {
    ad: ["naszej ery", "n.e.", "CE"],
    bc: ["przed naszą erą", "p.n.e.", "BCE"],
  },
  months: [
    ["stycznia", "sty", "styczeń"],
    ["lutego", "lut", "luty"],
    ["marca", "mar", "marzec"],
    ["kwietnia", "kwi", "kwiecień"],
    ["maja", "maj"],
    ["czerwca", "cze", "czerwiec"],
    ["lipca", "lip", "lipiec"],
    ["sierpnia", "sie", "sierpień"],
    ["września", "wrz", "wrzesień"],
    ["października", "paź", "październik"],
    ["listopada", "lis", "listopad"],
    ["grudnia", "gru", "grudzień"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "pl",
  weekdays: [
    ["niedziela", "niedz.", "nie"],
    ["poniedziałek", "pon.", "pon"],
    ["wtorek", "wt.", "wto"],
    ["środa", "śr.", "śro"],
    ["czwartek", "czw.", "czw"],
    ["piątek", "pt.", "pią"],
    ["sobota", "sob.", "sob"],
  ],
};

export { pl };
