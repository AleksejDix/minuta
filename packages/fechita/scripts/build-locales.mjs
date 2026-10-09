// Generates src/locales/<tag>.ts from Unicode CLDR (cldr-dates-full and
// Cldr-core): one file per locale with modern coverage.
// Run `npm run data -w fechita`; a test fails when the files are stale.

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { pathToFileURL } from "node:url";
import process from "node:process";

const require = createRequire(import.meta.url);
// An output directory may be given, e.g. by the freshness test
const FIRST_ARGUMENT = 2;
const [outDirectory] = process.argv.slice(FIRST_ARGUMENT);

function outputDirectory() {
  if (outDirectory === undefined) {
    return new URL("../src/locales/", import.meta.url);
  }
  return pathToFileURL(`${outDirectory}/`);
}

const OUT = outputDirectory();
const DATES = path.dirname(require.resolve("cldr-dates-full/package.json"));
const CORE = path.dirname(require.resolve("cldr-core/package.json"));
const MONTHS = 12;
const ONE = 1;
const NOT_FOUND = -1;
const HOUR_DIGITS = 2;
const START = 0;
const WEEKDAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const PERIOD_WIDTHS = ["abbreviated", "wide", "narrow"];
const IDENTIFIER = /^[A-Za-z_$][\w$]*$/u;

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

const CLDR_VERSION = readJson(path.join(DATES, "package.json")).version;
const LOCALES_WITH_DATES = new Set(readdirSync(path.join(DATES, "main")));
const DAY_PERIOD_RULES = readJson(
  path.join(CORE, "supplemental", "dayPeriods.json")
).supplemental.dayPeriodRuleSet;

function gregorian(tag) {
  return readJson(path.join(DATES, "main", tag, "ca-gregorian.json")).main[tag]
    .dates.calendars.gregorian;
}

function unique(values) {
  return [
    ...new Set(
      values.filter(
        (value) => typeof value === "string" && value.length > START
      )
    ),
  ];
}

function entryIn(table, place, key) {
  const widths = table[place.context] ?? {};
  const names = widths[place.width] ?? {};
  return names[key];
}

// All names of item `key` across contexts and widths, without alt variants
function namesOf(table, key, widths) {
  return unique(
    ["format", "stand-alone"].flatMap((context) =>
      widths.map((width) => entryIn(table, { context, width }, key))
    )
  );
}

function orderOf(pattern) {
  const positions = [
    ["D", pattern.search(/d/u)],
    ["M", pattern.search(/[ML]/u)],
    ["Y", pattern.search(/[yYu]/u)],
  ];
  return positions
    .filter(([, index]) => index !== NOT_FOUND)
    .toSorted((left, right) => left[ONE] - right[ONE])
    .map(([letter]) => letter)
    .join("");
}

function hoursOf(time) {
  return Number(time.slice(START, HOUR_DIGITS));
}

function rangeOf(rule) {
  if (rule._at !== undefined) {
    const at = hoursOf(rule._at);
    return { before: at + ONE, from: at };
  }
  return { before: hoursOf(rule._before), from: hoursOf(rule._from) };
}

function rulesOf(tag) {
  return (
    DAY_PERIOD_RULES[tag.replace("-", "_")] ??
    DAY_PERIOD_RULES[tag.split("-")[START]] ??
    {}
  );
}

// Flexible day periods ("晚上" 19:00–24:00) with their hour ranges
function flexiblePeriods(tag, table) {
  return Object.entries(rulesOf(tag))
    .map(([key, rule]) => {
      const { before, from } = rangeOf(rule);
      return { before, from, names: namesOf(table, key, PERIOD_WIDTHS) };
    })
    .filter((period) => period.names.length > START);
}

function regionOrders(tag, order) {
  return Object.fromEntries(
    [...LOCALES_WITH_DATES]
      .filter((locale) => locale.startsWith(`${tag}-`))
      .map((locale) => [locale, orderOf(gregorian(locale).dateFormats.short)])
      .filter(([, regional]) => regional !== order)
  );
}

function dayPeriodsOf(tag, table) {
  return {
    am: unique([
      ...namesOf(table, "am", PERIOD_WIDTHS),
      ...namesOf(table, "am-alt-variant", PERIOD_WIDTHS),
    ]),
    flexible: flexiblePeriods(tag, table),
    pm: unique([
      ...namesOf(table, "pm", PERIOD_WIDTHS),
      ...namesOf(table, "pm-alt-variant", PERIOD_WIDTHS),
    ]),
  };
}

function erasOf(eras) {
  return {
    ad: unique([
      eras.eraNames["1"],
      eras.eraAbbr["1"],
      eras.eraAbbr["1-alt-variant"],
    ]),
    bc: unique([
      eras.eraNames["0"],
      eras.eraAbbr["0"],
      eras.eraAbbr["0-alt-variant"],
    ]),
  };
}

function localeData(tag) {
  const calendar = gregorian(tag);
  const order = orderOf(calendar.dateFormats.short);
  return {
    dayPeriods: dayPeriodsOf(tag, calendar.dayPeriods),
    eras: erasOf(calendar.eras),
    months: Array.from({ length: MONTHS }, (_unused, index) =>
      namesOf(calendar.months, String(index + ONE), ["wide", "abbreviated"])
    ),
    order,
    regionOrders: regionOrders(tag, order),
    tag,
    weekdays: WEEKDAYS.map((day) =>
      namesOf(calendar.days, day, ["wide", "abbreviated", "short"])
    ),
  };
}

function keyOf(key) {
  if (IDENTIFIER.test(key)) {
    return key;
  }
  return JSON.stringify(key);
}

// A TypeScript literal with sorted, unquoted keys, as the lint rules want
function literal(value) {
  if (Array.isArray(value)) {
    return `[${value.map((item) => literal(item)).join(", ")}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.keys(value)
      .filter((key) => value[key] !== undefined)
      .toSorted()
      .map((key) => `${keyOf(key)}: ${literal(value[key])}`);
    return `{ ${entries.join(", ")} }`;
  }
  return JSON.stringify(value);
}

function identifierOf(tag) {
  return tag.replaceAll(/-(?<letter>\w)/gu, (_match, letter) =>
    letter.toUpperCase()
  );
}

function fileOf(tag) {
  return `// Generated from Unicode CLDR ${CLDR_VERSION} by scripts/build-locales.mjs. Do not edit.
import type { LocaleData } from "#src/types";

/** Date words and order of \`${tag}\` from Unicode CLDR ${CLDR_VERSION}. */
const ${identifierOf(tag)}: LocaleData = ${literal(localeData(tag))};

export { ${identifierOf(tag)} };
`;
}

function entryOf(tag) {
  const name = identifierOf(tag);
  if (name === tag) {
    return `  ${name},`;
  }
  return `  ${JSON.stringify(tag)}: ${name},`;
}

function allFile(tags) {
  const imports = tags
    .map((tag) => `import { ${identifierOf(tag)} } from "./${tag}";`)
    .join("\n");
  return `// Generated from Unicode CLDR ${CLDR_VERSION} by scripts/build-locales.mjs. Do not edit.
import type { Locales } from "#src/types";
${imports}

/** Every locale with modern coverage in Unicode CLDR ${CLDR_VERSION}, by tag. */
const allLocales: Locales = {
${tags.map((tag) => entryOf(tag)).join("\n")}
};

export { allLocales };
`;
}

function modernLocales() {
  const levels = readJson(
    path.join(CORE, "coverageLevels.json")
  ).coverageLevels;
  return Object.entries(levels)
    .filter(([tag, level]) => level === "modern" && LOCALES_WITH_DATES.has(tag))
    .map(([tag]) => tag)
    .toSorted();
}

const tags = modernLocales();
mkdirSync(OUT, { recursive: true });
for (const tag of tags) {
  writeFileSync(new URL(`${tag}.ts`, OUT), fileOf(tag));
}
writeFileSync(new URL("all.ts", OUT), allFile(tags));
process.stdout.write(
  `fechita: ${tags.length} locales from CLDR ${CLDR_VERSION}\n`
);
