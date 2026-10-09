// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `yue-Hans` from Unicode CLDR 48.2.0. */
const yueHans: LocaleData = {
  dayPeriods: {
    am: ["上昼"],
    flexible: [
      { before: 13, from: 12, names: ["中午"] },
      { before: 19, from: 13, names: ["下昼"] },
      { before: 24, from: 19, names: ["夜晚"] },
      { before: 1, from: 0, names: ["午夜"] },
      { before: 8, from: 5, names: ["清晨"] },
      { before: 12, from: 8, names: ["朝早"] },
      { before: 5, from: 0, names: ["凌晨"] },
    ],
    pm: ["下昼"],
  },
  eras: { ad: ["西元", "公元"], bc: ["西元前", "公元前"] },
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
  tag: "yue-Hans",
  weekdays: [
    ["星期日", "日"],
    ["星期一", "一"],
    ["星期二", "二"],
    ["星期三", "三"],
    ["星期四", "四"],
    ["星期五", "五"],
    ["星期六", "六"],
  ],
};

export { yueHans };
