// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `fr` from Unicode CLDR 48.2.0. */
const fr: LocaleData = {
  dayPeriods: {
    am: ["AM"],
    flexible: [
      {
        before: 18,
        from: 12,
        names: ["après-midi", "de l’après-midi", "ap.m."],
      },
      { before: 24, from: 18, names: ["soir", "du soir"] },
      { before: 1, from: 0, names: ["minuit"] },
      { before: 12, from: 4, names: ["matin", "du matin", "mat."] },
      { before: 4, from: 0, names: ["matin", "du matin"] },
      { before: 13, from: 12, names: ["midi"] },
    ],
    pm: ["PM"],
  },
  eras: {
    ad: ["après Jésus-Christ", "ap. J.-C.", "EC"],
    bc: ["avant Jésus-Christ", "av. J.-C.", "AEC"],
  },
  months: [
    ["janvier", "janv."],
    ["février", "févr."],
    ["mars"],
    ["avril", "avr."],
    ["mai"],
    ["juin"],
    ["juillet", "juil."],
    ["août"],
    ["septembre", "sept."],
    ["octobre", "oct."],
    ["novembre", "nov."],
    ["décembre", "déc."],
  ],
  order: "DMY",
  regionOrders: { "fr-CA": "YMD" },
  tag: "fr",
  weekdays: [
    ["dimanche", "dim.", "di"],
    ["lundi", "lun.", "lu"],
    ["mardi", "mar.", "ma"],
    ["mercredi", "mer.", "me"],
    ["jeudi", "jeu.", "je"],
    ["vendredi", "ven.", "ve"],
    ["samedi", "sam.", "sa"],
  ],
};

export { fr };
