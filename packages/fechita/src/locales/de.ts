// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `de` from Unicode CLDR 48.2.0. */
const de: LocaleData = {
  dayPeriods: {
    am: ["AM"],
    flexible: [
      { before: 13, from: 12, names: ["mittags", "Mittag"] },
      {
        before: 18,
        from: 13,
        names: ["nachm.", "nachmittags", "Nachm.", "Nachmittag"],
      },
      { before: 24, from: 18, names: ["abends", "Abend"] },
      { before: 1, from: 0, names: ["Mitternacht"] },
      { before: 10, from: 5, names: ["morgens", "Morgen"] },
      {
        before: 12,
        from: 10,
        names: ["vorm.", "vormittags", "Vorm.", "Vormittag"],
      },
      { before: 5, from: 0, names: ["nachts", "Nacht"] },
    ],
    pm: ["PM"],
  },
  eras: { ad: ["n. Chr.", "u. Z."], bc: ["v. Chr.", "v. u. Z."] },
  months: [
    ["Januar", "Jan.", "Jan"],
    ["Februar", "Feb.", "Feb"],
    ["März", "Mär"],
    ["April", "Apr.", "Apr"],
    ["Mai"],
    ["Juni", "Jun"],
    ["Juli", "Jul"],
    ["August", "Aug.", "Aug"],
    ["September", "Sept.", "Sep"],
    ["Oktober", "Okt.", "Okt"],
    ["November", "Nov.", "Nov"],
    ["Dezember", "Dez.", "Dez"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "de",
  weekdays: [
    ["Sonntag", "So.", "So"],
    ["Montag", "Mo.", "Mo"],
    ["Dienstag", "Di.", "Di"],
    ["Mittwoch", "Mi.", "Mi"],
    ["Donnerstag", "Do.", "Do"],
    ["Freitag", "Fr.", "Fr"],
    ["Samstag", "Sa.", "Sa"],
  ],
};

export { de };
