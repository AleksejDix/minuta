// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `hi-Latn` from Unicode CLDR 48.2.0. */
const hiLatn: LocaleData = {
  dayPeriods: {
    am: ["AM", "a", "am"],
    flexible: [
      { before: 16, from: 12, names: ["dopahar", "afternoon"] },
      { before: 20, from: 16, names: ["shaam", "evening"] },
      { before: 1, from: 0, names: ["midnight", "aadhi raat", "mi"] },
      { before: 12, from: 4, names: ["subah", "morning"] },
      { before: 4, from: 20, names: ["raat", "night"] },
    ],
    pm: ["PM", "p", "pm"],
  },
  eras: { ad: ["Anno Domini", "AD", "CE"], bc: ["Before Christ", "BC", "BCE"] },
  months: [
    ["January", "Jan"],
    ["February", "Feb"],
    ["March", "Mar"],
    ["April", "Apr"],
    ["May"],
    ["June", "Jun"],
    ["July", "Jul"],
    ["August", "Aug"],
    ["September", "Sep", "Sept"],
    ["October", "Oct"],
    ["November", "Nov"],
    ["December", "Dec"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "hi-Latn",
  weekdays: [
    ["Raviwaar", "Ravi", "Ra"],
    ["Somwaar", "Som", "So"],
    ["Mangalwaar", "Mangal", "Ma"],
    ["Budhwaar", "Budh", "Bu"],
    ["Guruwaar", "Guru", "Gu"],
    ["Shukrawaar", "Shukra", "Shu"],
    ["Shaniwaar", "Shani", "Sha"],
  ],
};

export { hiLatn };
