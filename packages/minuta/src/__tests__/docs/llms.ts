/*
 * Renders llms.txt (https://llmstxt.org): the whole public API on one page
 * for coding agents, generated from the source so it cannot drift.
 */

import type { ErrorCode, ExportDocs } from "./api-docs";

const NONE = 0;

type FirstEntry = (name: string) => string | undefined;

const PACKAGE_NAMES: Readonly<Record<string, string>> = {
  calendar: "minuta/calendar",
  core: "minuta/core",
  "date-fns": "minuta/date-fns",
  "date-fns-tz": "minuta/date-fns-tz",
  dayjs: "minuta/dayjs",
  format: "minuta/format",
  index: "minuta",
  intervals: "minuta/intervals",
  luxon: "minuta/luxon",
  moment: "minuta/moment",
  native: "minuta/native",
  temporal: "minuta/temporal",
};

const HEADER = `# minuta

> Divide time into pieces: pure functions over plain, deeply readonly \`Period\` data (\`{ start, end, unit }\`, \`end\` inclusive), with the date engine plugged in as data ("units").

## Rules

- Every unit-aware function exists twice: \`xWith(units, …)\` in \`minuta/core\` takes the units first; \`x(…)\` in \`minuta\` is the same function bound to the native \`Date\` units with weeks starting on Monday. Unit-free functions have one form and take no units.
- \`withUnits(units, { plugins })\` (from \`minuta/core\`) binds every core operation, and the functions of plugins such as \`calendar\` (\`minuta/calendar\`: grids, \`isWeekday\`, \`isWeekend\`) and \`intervals\` (\`minuta/intervals\`: \`gap\`, \`clamp\`, \`merge\`, \`split\`, \`resize\`, \`move\`, \`snap\`), to your units, e.g. \`withUnits(nativeUnits({ weekStartsOn: "sunday" }), { plugins: [calendar] })\`; the result's \`units\` are the units passed in. \`bind(units, plugin)\` binds a plugin on its own.
- \`Units\` is a partial map of unit specs; pass only the units you use (\`{ day, month }\`) to keep the bundle small.
- No result is \`undefined\`, never \`null\` (\`clamp\` without overlap, \`merge([])\`, …).
- Invalid input throws \`RangeError\`; the message starts with one of the error codes below and says how to fix it.
- Nothing is mutated: every function returns new data.
`;

function entryName(entry: string): string {
  return PACKAGE_NAMES[entry] ?? entry;
}

function codeBlock(code: string): string {
  return `\`\`\`ts\n${code}\n\`\`\``;
}

function renderExport(docs: ExportDocs): string {
  const parts = [`### \`${docs.name}\``];
  if (docs.signatures.length > NONE) {
    parts.push(codeBlock(docs.signatures.join("\n")));
  }
  if (docs.description !== "") {
    parts.push(docs.description);
  }
  for (const example of docs.examples) {
    parts.push(codeBlock(example));
  }
  return parts.join("\n\n");
}

function firstEntries(api: readonly ExportDocs[]): FirstEntry {
  const first = new Map<string, string>();
  for (const docs of api) {
    if (!first.has(docs.name)) {
      first.set(docs.name, docs.entry);
    }
  }
  return (name) => first.get(name);
}

function renderReference(docs: ExportDocs, firstEntry: string): string {
  return `### \`${docs.name}\`\n\nSame as \`${docs.name}\` in \`${entryName(firstEntry)}\`.`;
}

function renderEntry(
  entry: string,
  api: readonly ExportDocs[],
  firstEntryOf: FirstEntry
): string {
  const sections = api
    .filter((docs) => docs.entry === entry)
    .map((docs) => {
      const firstEntry = firstEntryOf(docs.name) ?? entry;
      if (firstEntry === entry) {
        return renderExport(docs);
      }
      return renderReference(docs, firstEntry);
    });
  return [`## \`${entryName(entry)}\``, ...sections].join("\n\n");
}

function renderErrors(codes: readonly ErrorCode[]): string {
  const lines = codes.map((code) => `- \`${code.code}\`: ${code.description}`);
  return `## Error codes\n\n${lines.join("\n")}`;
}

/**
 * The complete llms.txt for the given API.
 *
 * @param entries - Entries in the order to document them
 * @param api - Documented exports from `publicApi()`
 * @param codes - Error codes from `errorCodes()`
 * @returns The file content
 */
function renderLlms(
  entries: readonly string[],
  api: readonly ExportDocs[],
  codes: readonly ErrorCode[]
): string {
  const first = firstEntries(api);
  const sections = entries.map((entry) => renderEntry(entry, api, first));
  return `${[HEADER.trimEnd(), renderErrors(codes), ...sections].join("\n\n")}\n`;
}

export { renderLlms };
