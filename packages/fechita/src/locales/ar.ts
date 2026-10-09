// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `ar` from Unicode CLDR 48.2.0. */
const ar: LocaleData = {
  dayPeriods: {
    am: ["ص", "صباحًا"],
    flexible: [
      { before: 13, from: 12, names: ["ظهرًا"] },
      { before: 18, from: 13, names: ["بعد الظهر"] },
      { before: 24, from: 18, names: ["مساءً"] },
      { before: 6, from: 3, names: ["فجرًا", "في الصباح"] },
      { before: 12, from: 6, names: ["ص", "صباحًا"] },
      { before: 1, from: 0, names: ["في المساء", "منتصف الليل"] },
      { before: 3, from: 1, names: ["ليلاً"] },
    ],
    pm: ["م", "مساءً"],
  },
  eras: { ad: ["ميلادي", "م", "ب.م"], bc: ["قبل الميلاد", "ق.م", "ق. م"] },
  months: [
    ["يناير"],
    ["فبراير"],
    ["مارس"],
    ["أبريل"],
    ["مايو"],
    ["يونيو"],
    ["يوليو"],
    ["أغسطس"],
    ["سبتمبر"],
    ["أكتوبر"],
    ["نوفمبر"],
    ["ديسمبر"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "ar",
  weekdays: [
    ["الأحد", "أحد"],
    ["الاثنين", "إثنين"],
    ["الثلاثاء", "ثلاثاء"],
    ["الأربعاء", "أربعاء"],
    ["الخميس", "خميس"],
    ["الجمعة", "جمعة"],
    ["السبت", "سبت"],
  ],
};

export { ar };
