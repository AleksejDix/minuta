// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `he` from Unicode CLDR 48.2.0. */
const he: LocaleData = {
  dayPeriods: {
    am: ["AM", "לפנה״צ"],
    flexible: [
      { before: 16, from: 12, names: ["צהריים", "בצהריים"] },
      { before: 18, from: 16, names: ["אחר הצהריים", "אחה״צ"] },
      { before: 22, from: 18, names: ["ערב", "בערב"] },
      { before: 1, from: 0, names: ["חצות"] },
      { before: 12, from: 6, names: ["בוקר", "בבוקר"] },
      { before: 3, from: 22, names: ["לילה", "בלילה"] },
      { before: 6, from: 3, names: ["לפנות בוקר"] },
    ],
    pm: ["PM", "אחה״צ"],
  },
  eras: { ad: ["לספירה", "CE"], bc: ["לפני הספירה", "לפנה״ס", "BCE"] },
  months: [
    ["ינואר", "ינו׳"],
    ["פברואר", "פבר׳"],
    ["מרץ"],
    ["אפריל", "אפר׳"],
    ["מאי"],
    ["יוני"],
    ["יולי"],
    ["אוגוסט", "אוג׳"],
    ["ספטמבר", "ספט׳"],
    ["אוקטובר", "אוק׳"],
    ["נובמבר", "נוב׳"],
    ["דצמבר", "דצמ׳"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "he",
  weekdays: [
    ["יום ראשון", "יום א׳", "א׳"],
    ["יום שני", "יום ב׳", "ב׳"],
    ["יום שלישי", "יום ג׳", "ג׳"],
    ["יום רביעי", "יום ד׳", "ד׳"],
    ["יום חמישי", "יום ה׳", "ה׳"],
    ["יום שישי", "יום ו׳", "ו׳"],
    ["יום שבת", "שבת", "ש׳"],
  ],
};

export { he };
