// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `da` from Unicode CLDR 48.2.0. */
const da: LocaleData = {
  dayPeriods: {
    am: ["AM", "a"],
    flexible: [
      { before: 18, from: 12, names: ["om eftermiddagen", "eftermiddag"] },
      { before: 24, from: 18, names: ["om aftenen", "aften"] },
      { before: 1, from: 0, names: ["midnat"] },
      { before: 10, from: 5, names: ["om morgenen", "morgen"] },
      { before: 12, from: 10, names: ["om formiddagen", "formiddag"] },
      { before: 5, from: 0, names: ["om natten", "nat"] },
    ],
    pm: ["PM", "p"],
  },
  eras: {
    ad: ["efter Kristus", "e.Kr.", "v.t."],
    bc: ["før Kristus", "f.Kr.", "f.v.t."],
  },
  months: [
    ["januar", "jan."],
    ["februar", "feb."],
    ["marts", "mar."],
    ["april", "apr."],
    ["maj"],
    ["juni", "jun."],
    ["juli", "jul."],
    ["august", "aug."],
    ["september", "sep."],
    ["oktober", "okt."],
    ["november", "nov."],
    ["december", "dec."],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "da",
  weekdays: [
    ["søndag", "søn.", "sø."],
    ["mandag", "man.", "ma."],
    ["tirsdag", "tirs.", "ti."],
    ["onsdag", "ons.", "on."],
    ["torsdag", "tors.", "to."],
    ["fredag", "fre.", "fr."],
    ["lørdag", "lør.", "lø."],
  ],
};

export { da };
