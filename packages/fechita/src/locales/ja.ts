// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `ja` from Unicode CLDR 48.2.0. */
const ja: LocaleData = {
  dayPeriods: {
    am: ["午前"],
    flexible: [
      { before: 16, from: 12, names: ["昼"] },
      { before: 19, from: 16, names: ["夕方"] },
      { before: 1, from: 0, names: ["真夜中"] },
      { before: 12, from: 4, names: ["朝"] },
      { before: 23, from: 19, names: ["夜"] },
      { before: 4, from: 23, names: ["夜中"] },
      { before: 13, from: 12, names: ["正午"] },
    ],
    pm: ["午後"],
  },
  eras: { ad: ["西暦", "西暦紀元"], bc: ["紀元前", "西暦紀元前"] },
  months: [
    ["1月"],
    ["2月"],
    ["3月"],
    ["4月"],
    ["5月"],
    ["6月"],
    ["7月"],
    ["8月"],
    ["9月"],
    ["10月"],
    ["11月"],
    ["12月"],
  ],
  order: "YMD",
  regionOrders: {},
  tag: "ja",
  weekdays: [
    ["日曜日", "日"],
    ["月曜日", "月"],
    ["火曜日", "火"],
    ["水曜日", "水"],
    ["木曜日", "木"],
    ["金曜日", "金"],
    ["土曜日", "土"],
  ],
};

export { ja };
