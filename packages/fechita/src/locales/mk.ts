// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `mk` from Unicode CLDR 48.2.0. */
const mk: LocaleData = {
  dayPeriods: {
    am: ["претпл."],
    flexible: [
      { before: 18, from: 12, names: ["попладне", "попл."] },
      { before: 24, from: 18, names: ["навечер", "вечер"] },
      { before: 1, from: 0, names: ["полноќ", "полн."] },
      { before: 10, from: 4, names: ["наутро", "утро"] },
      { before: 12, from: 10, names: ["претпладне", "претпл."] },
      { before: 4, from: 0, names: ["ноќе", "ноќ"] },
      { before: 13, from: 12, names: ["напладне", "напл.", "пладне"] },
    ],
    pm: ["попл."],
  },
  eras: {
    ad: ["од нашата ера", "н. е."],
    bc: ["пред нашата ера", "пр. н. е."],
  },
  months: [
    ["јануари", "јан."],
    ["февруари", "фев."],
    ["март", "мар."],
    ["април", "апр."],
    ["мај"],
    ["јуни", "јун."],
    ["јули", "јул."],
    ["август", "авг."],
    ["септември", "сеп."],
    ["октомври", "окт."],
    ["ноември", "ное."],
    ["декември", "дек."],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "mk",
  weekdays: [
    ["недела", "нед."],
    ["понеделник", "пон."],
    ["вторник", "вто."],
    ["среда", "сре."],
    ["четврток", "чет."],
    ["петок", "пет."],
    ["сабота", "саб."],
  ],
};

export { mk };
