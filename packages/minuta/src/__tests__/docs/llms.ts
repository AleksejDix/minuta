/*
 * Renders llms.txt (https://llmstxt.org): the whole public API on one page
 * for coding agents, generated from the source so it cannot drift.
 */

import type { ErrorCode, ExportDocs } from "./api-docs";

const NONE = 0;

const PACKAGE_NAMES: Readonly<Record<string, string>> = {
  index: "@aleksejdix/minuta",
  temporal: "@aleksejdix/minuta/temporal",
};

const HEADER = `# minuta

> Divide time into pieces: pure functions over plain, deeply readonly \`Period\` data (\`{ start, end, unit }\`, \`start\` included and \`end\` excluded) of Temporal values: \`PlainDate\` for year to day, \`ZonedDateTime\` for hour to second. The unit rules are plain data ("units").

## Rules

- Two entries: \`@aleksejdix/minuta\` has every function; \`@aleksejdix/minuta/temporal\` has \`temporalReady()\`. Where the runtime has no Temporal, \`await temporalReady()\` first.
- The main entry is \`withUnits(createUnits())\`: weeks starting on Monday, moments in the runtime's zone, each date's own calendar. For other rules, \`withUnits(createUnits({ locale, weekStartsOn, weekend, timeZone, calendar }))\` returns every function with the same names; its \`units\` are the units passed in.
- Names follow Temporal: \`round\` takes Temporal's \`smallestUnit\`, \`roundingIncrement\` and \`roundingMode\`; \`equals\` and \`compare\` work like Temporal's; \`toLocaleString\` formats; \`count\` returns a number of units (\`start.until(end)\` gives a \`Temporal.Duration\`).
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

function renderEntry(entry: string, api: readonly ExportDocs[]): string {
  const sections = api
    .filter((docs) => docs.entry === entry)
    .map((docs) => renderExport(docs));
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
  const sections = entries.map((entry) => renderEntry(entry, api));
  return `${[HEADER.trimEnd(), renderErrors(codes), ...sections].join("\n\n")}\n`;
}

export { renderLlms };
