// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `es` from Unicode CLDR 48.2.0. */
const es: LocaleData = {
  dayPeriods: {
    am: ["a. m.", "a. m."],
    flexible: [
      { before: 20, from: 12, names: ["de la tarde", "tarde"] },
      { before: 6, from: 0, names: ["de la madrugada", "madrugada"] },
      { before: 12, from: 6, names: ["de la mañana", "mañana"] },
      { before: 24, from: 20, names: ["de la noche", "noche"] },
      { before: 13, from: 12, names: ["del mediodía", "mediodía"] },
    ],
    pm: ["p. m.", "p. m."],
  },
  eras: {
    ad: ["después de Cristo", "d. C.", "e. c."],
    bc: ["antes de Cristo", "a. C.", "a. e. c."],
  },
  months: [
    ["enero", "ene"],
    ["febrero", "feb"],
    ["marzo", "mar"],
    ["abril", "abr"],
    ["mayo", "may"],
    ["junio", "jun"],
    ["julio", "jul"],
    ["agosto", "ago"],
    ["septiembre", "sept"],
    ["octubre", "oct"],
    ["noviembre", "nov"],
    ["diciembre", "dic"],
  ],
  order: "DMY",
  regionOrders: { "es-PA": "MDY", "es-PR": "MDY" },
  tag: "es",
  weekdays: [
    ["domingo", "dom", "DO"],
    ["lunes", "lun", "LU"],
    ["martes", "mar", "MA"],
    ["miércoles", "mié", "MI"],
    ["jueves", "jue", "JU"],
    ["viernes", "vie", "VI"],
    ["sábado", "sáb", "SA"],
  ],
};

export { es };
