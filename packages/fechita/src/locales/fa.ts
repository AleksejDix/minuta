// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `fa` from Unicode CLDR 48.2.0. */
const fa: LocaleData = {
  dayPeriods: {
    am: ["ق.ظ.", "قبل‌ازظهر", "ق", "ق‌ظ"],
    flexible: [
      { before: 13, from: 12, names: ["ظهر", "بعدازظهر"] },
      { before: 19, from: 13, names: ["عصر"] },
      { before: 4, from: 1, names: ["بامداد"] },
      { before: 12, from: 4, names: ["صبح"] },
      { before: 24, from: 19, names: ["شب"] },
      { before: 1, from: 0, names: ["نیمه‌شب"] },
    ],
    pm: ["ب.ظ.", "بعدازظهر", "ب", "ب‌ظ"],
  },
  eras: { ad: ["میلادی", "م.", "د.م."], bc: ["قبل از میلاد", "ق.م.", "ق.د.م"] },
  months: [
    ["ژانویهٔ", "ژانویه"],
    ["فوریهٔ", "فوریه"],
    ["مارس"],
    ["آوریل"],
    ["مهٔ", "مه"],
    ["ژوئن"],
    ["ژوئیهٔ", "ژوئیه"],
    ["اوت"],
    ["سپتامبر"],
    ["اکتبر"],
    ["نوامبر"],
    ["دسامبر"],
  ],
  order: "YMD",
  regionOrders: {},
  tag: "fa",
  weekdays: [
    ["یکشنبه", "۱ش"],
    ["دوشنبه", "۲ش"],
    ["سه‌شنبه", "۳ش"],
    ["چهارشنبه", "۴ش"],
    ["پنجشنبه", "۵ش"],
    ["جمعه", "ج"],
    ["شنبه", "ش"],
  ],
};

export { fa };
