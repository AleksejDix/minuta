// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `ms` from Unicode CLDR 48.2.0. */
const ms: LocaleData = {
  dayPeriods: {
    am: ["PG"],
    flexible: [
      { before: 14, from: 12, names: ["tengah hari"] },
      { before: 19, from: 14, names: ["petang"] },
      { before: 1, from: 0, names: ["pagi", "tengah malam"] },
      { before: 12, from: 1, names: ["pagi"] },
      { before: 24, from: 19, names: ["malam"] },
    ],
    pm: ["PTG"],
  },
  eras: { ad: ["TM"], bc: ["S.M."] },
  months: [
    ["Januari", "Jan"],
    ["Februari", "Feb"],
    ["Mac"],
    ["April", "Apr"],
    ["Mei"],
    ["Jun"],
    ["Julai", "Jul"],
    ["Ogos", "Ogo"],
    ["September", "Sep"],
    ["Oktober", "Okt"],
    ["November", "Nov"],
    ["Disember", "Dis"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "ms",
  weekdays: [
    ["Ahad", "Ahd", "Ah"],
    ["Isnin", "Isn", "Is"],
    ["Selasa", "Sel", "Se"],
    ["Rabu", "Rab", "Ra"],
    ["Khamis", "Kha", "Kh"],
    ["Jumaat", "Jum", "Ju"],
    ["Sabtu", "Sab", "Sa"],
  ],
};

export { ms };
