// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `sk` from Unicode CLDR 48.2.0. */
const sk: LocaleData = {
  dayPeriods: {
    am: ["AM"],
    flexible: [
      {
        before: 18,
        from: 12,
        names: ["popol.", "popoludní", "pop.", "popoludnie"],
      },
      { before: 22, from: 18, names: ["večer", "več."] },
      {
        before: 1,
        from: 0,
        names: ["o poln.", "o polnoci", "poln.", "polnoc"],
      },
      { before: 9, from: 4, names: ["ráno"] },
      {
        before: 12,
        from: 9,
        names: ["dopol.", "dopoludnia", "dop.", "dopoludnie"],
      },
      { before: 4, from: 22, names: ["v noci", "v n.", "noc"] },
      {
        before: 13,
        from: 12,
        names: ["napol.", "napoludnie", "nap.", "pol.", "poludnie"],
      },
    ],
    pm: ["PM"],
  },
  eras: {
    ad: ["po Kristovi", "po Kr.", "n. l."],
    bc: ["pred Kristom", "pred Kr.", "pred n. l."],
  },
  months: [
    ["januára", "jan", "január"],
    ["februára", "feb", "február"],
    ["marca", "mar", "marec"],
    ["apríla", "apr", "apríl"],
    ["mája", "máj"],
    ["júna", "jún"],
    ["júla", "júl"],
    ["augusta", "aug", "august"],
    ["septembra", "sep", "september"],
    ["októbra", "okt", "október"],
    ["novembra", "nov", "november"],
    ["decembra", "dec", "december"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "sk",
  weekdays: [
    ["nedeľa", "ne"],
    ["pondelok", "po"],
    ["utorok", "ut"],
    ["streda", "st"],
    ["štvrtok", "št"],
    ["piatok", "pi"],
    ["sobota", "so"],
  ],
};

export { sk };
