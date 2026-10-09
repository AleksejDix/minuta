// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `pt` from Unicode CLDR 48.2.0. */
const pt: LocaleData = {
  dayPeriods: {
    am: ["AM"],
    flexible: [
      { before: 19, from: 12, names: ["da tarde", "tarde"] },
      { before: 24, from: 19, names: ["da noite", "noite"] },
      { before: 1, from: 0, names: ["meia-noite"] },
      { before: 12, from: 6, names: ["da manhã", "manhã"] },
      { before: 6, from: 0, names: ["da madrugada", "madrugada"] },
      { before: 13, from: 12, names: ["meio-dia"] },
    ],
    pm: ["PM"],
  },
  eras: {
    ad: ["depois de Cristo", "d.C.", "EC"],
    bc: ["antes de Cristo", "a.C.", "AEC"],
  },
  months: [
    ["janeiro", "jan."],
    ["fevereiro", "fev."],
    ["março", "mar."],
    ["abril", "abr."],
    ["maio", "mai."],
    ["junho", "jun."],
    ["julho", "jul."],
    ["agosto", "ago."],
    ["setembro", "set."],
    ["outubro", "out."],
    ["novembro", "nov."],
    ["dezembro", "dez."],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "pt",
  weekdays: [
    ["domingo", "dom."],
    ["segunda-feira", "seg."],
    ["terça-feira", "ter."],
    ["quarta-feira", "qua."],
    ["quinta-feira", "qui."],
    ["sexta-feira", "sex."],
    ["sábado", "sáb."],
  ],
};

export { pt };
