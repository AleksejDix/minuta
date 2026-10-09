// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `ca` from Unicode CLDR 48.2.0. */
const ca: LocaleData = {
  dayPeriods: {
    am: ["a. m.", "a. m."],
    flexible: [
      { before: 13, from: 12, names: ["migdia"] },
      { before: 19, from: 13, names: ["tarda"] },
      { before: 21, from: 19, names: ["vespre"] },
      { before: 1, from: 0, names: ["mitjanit"] },
      { before: 6, from: 0, names: ["matinada"] },
      { before: 12, from: 6, names: ["matí"] },
      { before: 24, from: 21, names: ["nit"] },
    ],
    pm: ["p. m.", "p. m."],
  },
  eras: {
    ad: ["després de Crist", "dC", "EC"],
    bc: ["abans de Crist", "aC", "AEC"],
  },
  months: [
    ["de gener", "de gen.", "gener", "gen."],
    ["de febrer", "de febr.", "febrer", "febr."],
    ["de març", "març"],
    ["d’abril", "d’abr.", "abril", "abr."],
    ["de maig", "maig"],
    ["de juny", "juny"],
    ["de juliol", "de jul.", "juliol", "jul."],
    ["d’agost", "d’ag.", "agost", "ag."],
    ["de setembre", "de set.", "setembre", "set."],
    ["d’octubre", "d’oct.", "octubre", "oct."],
    ["de novembre", "de nov.", "novembre", "nov."],
    ["de desembre", "de des.", "desembre", "des."],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "ca",
  weekdays: [
    ["diumenge", "dg."],
    ["dilluns", "dl."],
    ["dimarts", "dt."],
    ["dimecres", "dc."],
    ["dijous", "dj."],
    ["divendres", "dv."],
    ["dissabte", "ds."],
  ],
};

export { ca };
