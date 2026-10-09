// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `ko` from Unicode CLDR 48.2.0. */
const ko: LocaleData = {
  dayPeriods: {
    am: ["오전"],
    flexible: [
      { before: 18, from: 12, names: ["오후"] },
      { before: 21, from: 18, names: ["저녁"] },
      { before: 1, from: 0, names: ["자정"] },
      { before: 6, from: 3, names: ["아침"] },
      { before: 12, from: 6, names: ["오전"] },
      { before: 3, from: 21, names: ["밤"] },
      { before: 13, from: 12, names: ["정오"] },
    ],
    pm: ["오후"],
  },
  eras: { ad: ["서기", "AD", "CE"], bc: ["기원전", "BC", "BCE"] },
  months: [
    ["1월"],
    ["2월"],
    ["3월"],
    ["4월"],
    ["5월"],
    ["6월"],
    ["7월"],
    ["8월"],
    ["9월"],
    ["10월"],
    ["11월"],
    ["12월"],
  ],
  order: "YMD",
  regionOrders: {},
  tag: "ko",
  weekdays: [
    ["일요일", "일"],
    ["월요일", "월"],
    ["화요일", "화"],
    ["수요일", "수"],
    ["목요일", "목"],
    ["금요일", "금"],
    ["토요일", "토"],
  ],
};

export { ko };
