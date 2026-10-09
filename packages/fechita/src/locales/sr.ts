// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `sr` from Unicode CLDR 48.2.0. */
const sr: LocaleData = {
  dayPeriods: {
    am: ["AM"],
    flexible: [
      { before: 18, from: 12, names: ["по подне", "поподне"] },
      { before: 21, from: 18, names: ["увече", "вече"] },
      { before: 1, from: 0, names: ["поноћ"] },
      { before: 12, from: 6, names: ["ујутру", "јутро"] },
      { before: 6, from: 21, names: ["ноћу", "ноћ"] },
      { before: 13, from: 12, names: ["подне"] },
    ],
    pm: ["PM"],
  },
  eras: { ad: ["нове ере", "н. е."], bc: ["пре нове ере", "п. н. е."] },
  months: [
    ["јануар", "јан"],
    ["фебруар", "феб"],
    ["март", "мар"],
    ["април", "апр"],
    ["мај"],
    ["јун"],
    ["јул"],
    ["август", "авг"],
    ["септембар", "сеп"],
    ["октобар", "окт"],
    ["новембар", "нов"],
    ["децембар", "дец"],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "sr",
  weekdays: [
    ["недеља", "нед", "не"],
    ["понедељак", "пон", "по"],
    ["уторак", "уто", "ут"],
    ["среда", "сре", "ср"],
    ["четвртак", "чет", "че"],
    ["петак", "пет", "пе"],
    ["субота", "суб", "су"],
  ],
};

export { sr };
