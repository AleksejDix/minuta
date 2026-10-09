// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `gl` from Unicode CLDR 48.2.0. */
const gl: LocaleData = {
  dayPeriods: {
    am: ["a.m."],
    flexible: [
      { before: 13, from: 12, names: ["do mediodía", "mediodía"] },
      { before: 21, from: 13, names: ["da tarde", "tarde"] },
      { before: 1, from: 0, names: ["da noite", "medianoite"] },
      { before: 6, from: 0, names: ["da madrugada", "madrugada"] },
      { before: 12, from: 6, names: ["da mañá", "mañá"] },
      { before: 24, from: 21, names: ["da noite", "noite"] },
    ],
    pm: ["p.m."],
  },
  eras: {
    ad: ["despois de Cristo", "d.C.", "e.c."],
    bc: ["antes de Cristo", "a.C.", "a.e.c."],
  },
  months: [
    ["xaneiro", "xan."],
    ["febreiro", "feb."],
    ["marzo", "mar."],
    ["abril", "abr."],
    ["maio"],
    ["xuño"],
    ["xullo", "xul."],
    ["agosto", "ago."],
    ["setembro", "set."],
    ["outubro", "out."],
    ["novembro", "nov."],
    ["decembro", "dec."],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "gl",
  weekdays: [
    ["domingo", "dom.", "do."],
    ["luns", "lu."],
    ["martes", "mar.", "ma."],
    ["mércores", "mér.", "mé."],
    ["xoves", "xov.", "xo."],
    ["venres", "ven.", "ve."],
    ["sábado", "sáb.", "sá."],
  ],
};

export { gl };
