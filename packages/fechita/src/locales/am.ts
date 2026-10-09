// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `am` from Unicode CLDR 48.2.0. */
const am: LocaleData = {
  dayPeriods: {
    am: ["ጥዋት", "ጠ"],
    flexible: [
      { before: 18, from: 12, names: ["ከሰዓት"] },
      { before: 24, from: 18, names: ["በምሽት", "ምሽት"] },
      { before: 1, from: 0, names: ["እኩለ ሌሊት"] },
      { before: 12, from: 6, names: ["ጥዋት"] },
      { before: 6, from: 0, names: ["በሌሊት", "ሌሊት"] },
      { before: 13, from: 12, names: ["ቀትር", "ቀ"] },
    ],
    pm: ["ከሰዓት", "ከ"],
  },
  eras: { ad: ["ዓመተ ምሕረት", "ዓ/ም"], bc: ["ዓመተ ዓለም", "ዓ/ዓ"] },
  months: [
    ["ጃንዋሪ", "ጃን"],
    ["ፌብሩዋሪ", "ፌብ"],
    ["ማርች"],
    ["ኤፕሪል", "ኤፕሪ"],
    ["ሜይ"],
    ["ጁን"],
    ["ጁላይ"],
    ["ኦገስት", "ኦገስ"],
    ["ሴፕቴምበር", "ሴፕቴ"],
    ["ኦክቶበር", "ኦክቶ"],
    ["ኖቬምበር", "ኖቬም"],
    ["ዲሴምበር", "ዲሴም"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "am",
  weekdays: [
    ["እሑድ", "እ"],
    ["ሰኞ", "ሰ"],
    ["ማክሰኞ", "ማክሰ", "ማ"],
    ["ረቡዕ", "ረ"],
    ["ሐሙስ", "ሐ"],
    ["ዓርብ", "ዓ"],
    ["ቅዳሜ", "ቅ"],
  ],
};

export { am };
