// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `sq` from Unicode CLDR 48.2.0. */
const sq: LocaleData = {
  dayPeriods: {
    am: ["p.d.", "e paradites", "paradite"],
    flexible: [
      { before: 18, from: 12, names: ["e pasdites", "pasdite"] },
      { before: 24, from: 18, names: ["e mbrëmjes", "mbrëmje"] },
      { before: 1, from: 0, names: ["e mesnatës", "mesnatë"] },
      { before: 9, from: 4, names: ["e mëngjesit", "mëngjes"] },
      { before: 12, from: 9, names: ["e paradites", "paradite"] },
      { before: 4, from: 0, names: ["e natës", "natë"] },
      { before: 13, from: 12, names: ["e mesditës", "mesditë"] },
    ],
    pm: ["m.d.", "e pasdites", "pasdite"],
  },
  eras: {
    ad: ["mbas Krishtit", "mb.K.", "e.s."],
    bc: ["para Krishtit", "p.K.", "p.e.s."],
  },
  months: [
    ["janar", "jan"],
    ["shkurt", "shk"],
    ["mars", "mar"],
    ["prill", "pri"],
    ["maj"],
    ["qershor", "qer"],
    ["korrik", "korr"],
    ["gusht", "gush"],
    ["shtator", "sht"],
    ["tetor", "tet"],
    ["nëntor", "nën"],
    ["dhjetor", "dhj"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "sq",
  weekdays: [
    ["e diel", "die"],
    ["e hënë", "hën"],
    ["e martë", "mar"],
    ["e mërkurë", "mër"],
    ["e enjte", "enj"],
    ["e premte", "pre"],
    ["e shtunë", "sht"],
  ],
};

export { sq };
