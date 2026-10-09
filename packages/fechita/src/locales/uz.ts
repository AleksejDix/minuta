// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `uz` from Unicode CLDR 48.2.0. */
const uz: LocaleData = {
  dayPeriods: {
    am: ["TO"],
    flexible: [
      { before: 18, from: 11, names: ["kunduzi"] },
      { before: 22, from: 18, names: ["kechqurun"] },
      { before: 1, from: 0, names: ["yarim tun"] },
      { before: 11, from: 6, names: ["ertalab"] },
      { before: 6, from: 22, names: ["kechasi"] },
      { before: 13, from: 12, names: ["tush payti"] },
    ],
    pm: ["TK"],
  },
  eras: { ad: ["milodiy", "mil."], bc: ["miloddan avvalgi", "m.a.", "e.a."] },
  months: [
    ["yanvar", "yan", "Yanvar", "Yan"],
    ["fevral", "fev", "Fevral", "Fev"],
    ["mart", "mar", "Mart", "Mar"],
    ["aprel", "apr", "Aprel", "Apr"],
    ["may", "May"],
    ["iyun", "iyn", "Iyun", "Iyn"],
    ["iyul", "iyl", "Iyul", "Iyl"],
    ["avgust", "avg", "Avgust", "Avg"],
    ["sentabr", "sen", "Sentabr", "Sen"],
    ["oktabr", "okt", "Oktabr", "Okt"],
    ["noyabr", "noy", "Noyabr", "Noy"],
    ["dekabr", "dek", "Dekabr", "Dek"],
  ],
  order: "DMY",
  regionOrders: { "uz-Arab": "YMD" },
  tag: "uz",
  weekdays: [
    ["yakshanba", "Yak", "Ya"],
    ["dushanba", "Dush", "Du"],
    ["seshanba", "Sesh", "Se"],
    ["chorshanba", "Chor", "Ch"],
    ["payshanba", "Pay", "Pa"],
    ["juma", "Jum", "Ju"],
    ["shanba", "Shan", "Sh"],
  ],
};

export { uz };
