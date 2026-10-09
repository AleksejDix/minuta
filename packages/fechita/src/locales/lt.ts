// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `lt` from Unicode CLDR 48.2.0. */
const lt: LocaleData = {
  dayPeriods: {
    am: ["priešpiet", "pr. p."],
    flexible: [
      { before: 18, from: 12, names: ["popietė", "diena"] },
      { before: 24, from: 18, names: ["vakaras"] },
      { before: 1, from: 0, names: ["vidurnaktis"] },
      { before: 12, from: 6, names: ["rytas"] },
      { before: 6, from: 0, names: ["naktis"] },
      { before: 13, from: 12, names: ["perpiet", "vidurdienis"] },
    ],
    pm: ["popiet", "pop."],
  },
  eras: {
    ad: ["po Kristaus", "po Kr.", "mūsų eroje"],
    bc: ["prieš Kristų", "pr. Kr.", "pr. m. e."],
  },
  months: [
    ["sausio", "saus.", "sausis"],
    ["vasario", "vas.", "vasaris"],
    ["kovo", "kov.", "kovas"],
    ["balandžio", "bal.", "balandis"],
    ["gegužės", "geg.", "gegužė"],
    ["birželio", "birž.", "birželis"],
    ["liepos", "liep.", "liepa"],
    ["rugpjūčio", "rugp.", "rugpjūtis"],
    ["rugsėjo", "rugs.", "rugsėjis"],
    ["spalio", "spal.", "spalis"],
    ["lapkričio", "lapkr.", "lapkritis"],
    ["gruodžio", "gruod.", "gruodis"],
  ],
  order: "YMD",
  regionOrders: {},
  tag: "lt",
  weekdays: [
    ["sekmadienis", "sk", "Sk"],
    ["pirmadienis", "pr", "Pr"],
    ["antradienis", "an", "An"],
    ["trečiadienis", "tr", "Tr"],
    ["ketvirtadienis", "kt", "Kt"],
    ["penktadienis", "pn", "Pn"],
    ["šeštadienis", "št", "Št"],
  ],
};

export { lt };
