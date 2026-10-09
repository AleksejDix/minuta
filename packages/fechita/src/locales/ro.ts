// Generated from Unicode CLDR 48.2.0 by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of `ro` from Unicode CLDR 48.2.0. */
const ro: LocaleData = {
  dayPeriods: {
    am: ["a.m."],
    flexible: [
      { before: 18, from: 12, names: ["după-amiaza"] },
      { before: 22, from: 18, names: ["seara"] },
      { before: 1, from: 0, names: ["miezul nopții", "la miezul nopții"] },
      { before: 12, from: 5, names: ["dimineața"] },
      { before: 5, from: 22, names: ["noaptea"] },
      { before: 13, from: 12, names: ["amiază", "la amiază"] },
    ],
    pm: ["p.m."],
  },
  eras: {
    ad: ["după Hristos", "d.Hr.", "e.n."],
    bc: ["înainte de Hristos", "î.Hr.", "î.e.n"],
  },
  months: [
    ["ianuarie", "ian."],
    ["februarie", "feb."],
    ["martie", "mar."],
    ["aprilie", "apr."],
    ["mai"],
    ["iunie", "iun."],
    ["iulie", "iul."],
    ["august", "aug."],
    ["septembrie", "sept."],
    ["octombrie", "oct."],
    ["noiembrie", "nov."],
    ["decembrie", "dec."],
  ],
  order: "DMY",
  regionOrders: {},
  tag: "ro",
  weekdays: [
    ["duminică", "dum.", "du."],
    ["luni", "lun.", "lu."],
    ["marți", "mar.", "ma."],
    ["miercuri", "mie.", "mi."],
    ["joi"],
    ["vineri", "vin.", "vi."],
    ["sâmbătă", "sâm.", "sâ."],
  ],
};

export { ro };
