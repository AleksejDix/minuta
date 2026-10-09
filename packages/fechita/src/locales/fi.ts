// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `fi` from Unicode CLDR 48.2.0. */
const fi: LocaleData = {
  dayPeriods: {
    am: ["ap."],
    flexible: [
      {
        before: 18,
        from: 12,
        names: ["iltap.", "iltapäivällä", "ip.", "iltapäivä"],
      },
      { before: 23, from: 18, names: ["illalla", "ilta"] },
      { before: 1, from: 0, names: ["keskiyöllä", "ky.", "keskiyö"] },
      { before: 10, from: 5, names: ["aamulla", "aamu"] },
      {
        before: 12,
        from: 10,
        names: ["aamup.", "aamupäivällä", "ap.", "aamupäivä"],
      },
      { before: 5, from: 23, names: ["yöllä", "yö"] },
      {
        before: 13,
        from: 12,
        names: ["keskip.", "keskipäivällä", "kp.", "keskipäivä"],
      },
    ],
    pm: ["ip."],
  },
  eras: {
    ad: ["jälkeen Kristuksen syntymän", "jKr.", "jaa."],
    bc: ["ennen Kristuksen syntymää", "eKr.", "eaa."],
  },
  months: [
    ["tammikuuta", "tammi", "tammikuu"],
    ["helmikuuta", "helmi", "helmikuu"],
    ["maaliskuuta", "maalis", "maaliskuu"],
    ["huhtikuuta", "huhti", "huhtikuu"],
    ["toukokuuta", "touko", "toukokuu"],
    ["kesäkuuta", "kesä", "kesäkuu"],
    ["heinäkuuta", "heinä", "heinäkuu"],
    ["elokuuta", "elo", "elokuu"],
    ["syyskuuta", "syys", "syyskuu"],
    ["lokakuuta", "loka", "lokakuu"],
    ["marraskuuta", "marras", "marraskuu"],
    ["joulukuuta", "joulu", "joulukuu"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "fi",
  weekdays: [
    ["sunnuntaina", "su", "sunnuntai"],
    ["maanantaina", "ma", "maanantai"],
    ["tiistaina", "ti", "tiistai"],
    ["keskiviikkona", "ke", "keskiviikko"],
    ["torstaina", "to", "torstai"],
    ["perjantaina", "pe", "perjantai"],
    ["lauantaina", "la", "lauantai"],
  ],
};

export { fi };
