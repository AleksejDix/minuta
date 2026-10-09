// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `bg` from Unicode CLDR 48.2.0. */
const bg: LocaleData = {
  dayPeriods: {
    am: ["am", "пр.об."],
    flexible: [
      { before: 18, from: 14, names: ["следобед"] },
      { before: 22, from: 18, names: ["вечерта"] },
      { before: 1, from: 0, names: ["полунощ"] },
      { before: 11, from: 4, names: ["сутринта"] },
      { before: 14, from: 11, names: ["на обяд"] },
      { before: 4, from: 22, names: ["през нощта"] },
    ],
    pm: ["pm", "сл.об."],
  },
  eras: {
    ad: ["след Христа", "сл.Хр.", "сл.н.е."],
    bc: ["преди Христа", "пр.Хр.", "пр.н.е."],
  },
  months: [
    ["януари", "яну"],
    ["февруари", "фев"],
    ["март"],
    ["април", "апр"],
    ["май"],
    ["юни"],
    ["юли"],
    ["август", "авг"],
    ["септември", "сеп"],
    ["октомври", "окт"],
    ["ноември", "ное"],
    ["декември", "дек"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "bg",
  weekdays: [
    ["неделя", "нд"],
    ["понеделник", "пн"],
    ["вторник", "вт"],
    ["сряда", "ср"],
    ["четвъртък", "чт"],
    ["петък", "пт"],
    ["събота", "сб"],
  ],
};

export { bg };
