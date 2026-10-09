// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `az` from Unicode CLDR 48.2.0. */
const az: LocaleData = {
  dayPeriods: {
    am: ["AM", "a"],
    flexible: [
      { before: 17, from: 12, names: ["gündüz"] },
      { before: 19, from: 17, names: ["axşamüstü"] },
      { before: 1, from: 0, names: ["gecəyarı"] },
      { before: 6, from: 4, names: ["sübh"] },
      { before: 12, from: 6, names: ["səhər"] },
      { before: 24, from: 19, names: ["axşam"] },
      { before: 4, from: 0, names: ["gecə"] },
      { before: 13, from: 12, names: ["günorta", "g"] },
    ],
    pm: ["PM", "p"],
  },
  eras: {
    ad: ["yeni era", "y.e.", "b.e."],
    bc: ["eramızdan əvvəl", "e.ə.", "b.e.ə."],
  },
  months: [
    ["yanvar", "yan"],
    ["fevral", "fev"],
    ["mart", "mar"],
    ["aprel", "apr"],
    ["may"],
    ["iyun", "iyn"],
    ["iyul", "iyl"],
    ["avqust", "avq"],
    ["sentyabr", "sen"],
    ["oktyabr", "okt"],
    ["noyabr", "noy"],
    ["dekabr", "dek"],
  ],
  order: "DMY",
  regionOrders: { "az-Arab": "YMD", "az-Arab-IQ": "YMD", "az-Arab-TR": "YMD" },
  tag: "az",
  weekdays: [
    ["bazar", "B."],
    ["bazar ertəsi", "B.e.", "B.E."],
    ["çərşənbə axşamı", "Ç.a.", "Ç.A."],
    ["çərşənbə", "Ç."],
    ["cümə axşamı", "C.a.", "C.A."],
    ["cümə", "C."],
    ["şənbə", "Ş."],
  ],
};

export { az };
