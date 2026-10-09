// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `zh` from Unicode CLDR 48.2.0. */
const zh: LocaleData = {
  dayPeriods: {
    am: ["上午"],
    flexible: [
      { before: 13, from: 12, names: ["中午"] },
      { before: 19, from: 13, names: ["下午"] },
      { before: 24, from: 19, names: ["晚上"] },
      { before: 1, from: 0, names: ["午夜"] },
      { before: 8, from: 5, names: ["早上", "清晨"] },
      { before: 12, from: 8, names: ["上午"] },
      { before: 5, from: 0, names: ["凌晨"] },
    ],
    pm: ["下午"],
  },
  eras: { ad: ["公元"], bc: ["公元前"] },
  months: [
    ["一月", "1月"],
    ["二月", "2月"],
    ["三月", "3月"],
    ["四月", "4月"],
    ["五月", "5月"],
    ["六月", "6月"],
    ["七月", "7月"],
    ["八月", "8月"],
    ["九月", "9月"],
    ["十月", "10月"],
    ["十一月", "11月"],
    ["十二月", "12月"],
  ],
  order: "YMD",
  regionOrders: {
    "zh-Hans-HK": "DMY",
    "zh-Hans-MO": "DMY",
    "zh-Hans-SG": "DMY",
    "zh-Hant-HK": "DMY",
    "zh-Hant-MO": "DMY",
  },
  tag: "zh",
  weekdays: [
    ["星期日", "周日"],
    ["星期一", "周一"],
    ["星期二", "周二"],
    ["星期三", "周三"],
    ["星期四", "周四"],
    ["星期五", "周五"],
    ["星期六", "周六"],
  ],
};

export { zh };
