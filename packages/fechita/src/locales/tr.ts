// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `tr` from Unicode CLDR 48.2.0. */
const tr: LocaleData = {
  dayPeriods: {
    am: ["ÖÖ", "öö"],
    flexible: [
      { before: 18, from: 12, names: ["öğleden sonra"] },
      { before: 19, from: 18, names: ["akşamüstü"] },
      { before: 21, from: 19, names: ["akşam"] },
      { before: 1, from: 0, names: ["gece yarısı", "gece"] },
      { before: 11, from: 6, names: ["sabah"] },
      { before: 12, from: 11, names: ["öğleden önce"] },
      { before: 6, from: 21, names: ["gece"] },
      { before: 13, from: 12, names: ["öğle", "ö"] },
    ],
    pm: ["ÖS", "ös"],
  },
  eras: {
    ad: ["Milattan Sonra", "MS", "İS"],
    bc: ["Milattan Önce", "MÖ", "İÖ"],
  },
  months: [
    ["Ocak", "Oca"],
    ["Şubat", "Şub"],
    ["Mart", "Mar"],
    ["Nisan", "Nis"],
    ["Mayıs", "May"],
    ["Haziran", "Haz"],
    ["Temmuz", "Tem"],
    ["Ağustos", "Ağu"],
    ["Eylül", "Eyl"],
    ["Ekim", "Eki"],
    ["Kasım", "Kas"],
    ["Aralık", "Ara"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "tr",
  weekdays: [
    ["Pazar", "Paz", "Pa"],
    ["Pazartesi", "Pzt", "Pt"],
    ["Salı", "Sal", "Sa"],
    ["Çarşamba", "Çar", "Ça"],
    ["Perşembe", "Per", "Pe"],
    ["Cuma", "Cum", "Cu"],
    ["Cumartesi", "Cmt", "Ct"],
  ],
};

export { tr };
