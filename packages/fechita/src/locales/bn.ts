// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `bn` from Unicode CLDR 48.2.0. */
const bn: LocaleData = {
  dayPeriods: {
    am: ["AM"],
    flexible: [
      { before: 16, from: 12, names: ["দুপুর", "দুপুরবেলায়"] },
      { before: 18, from: 16, names: ["বিকাল"] },
      { before: 20, from: 18, names: ["সন্ধ্যা", "সন্ধ্যাবেলায়"] },
      { before: 6, from: 4, names: ["ভোর", "ভোরবেলায়"] },
      { before: 12, from: 6, names: ["সকাল", "সকালবেলায়"] },
      { before: 4, from: 20, names: ["রাত্রি", "রাত্রিবেলায়"] },
    ],
    pm: ["PM"],
  },
  eras: { ad: ["খ্রিস্টাব্দ", "খৃষ্টাব্দ", "খ্রিষ্টাব্দ"], bc: ["খ্রিস্টপূর্ব", '"খ্রিঃপূঃ"'] },
  months: [
    ["জানুয়ারি", "জানু"],
    ["ফেব্রুয়ারি", "ফেব"],
    ["মার্চ"],
    ["এপ্রিল", "এপ্রি"],
    ["মে"],
    ["জুন"],
    ["জুলাই", "জুল"],
    ["আগস্ট", "আগ"],
    ["সেপ্টেম্বর", "সেপ", "সেপ্ট"],
    ["অক্টোবর", "অক্টো"],
    ["নভেম্বর", "নভে"],
    ["ডিসেম্বর", "ডিসে"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "bn",
  weekdays: [
    ["রবিবার", "রবি", "রঃ"],
    ["সোমবার", "সোম", "সোঃ"],
    ["মঙ্গলবার", "মঙ্গল", "মঃ"],
    ["বুধবার", "বুধ", "বুঃ"],
    ["বৃহস্পতিবার", "বৃহস্পতি", "বৃঃ"],
    ["শুক্রবার", "শুক্র", "শুঃ"],
    ["শনিবার", "শনি"],
  ],
};

export { bn };
