/**
 * Fails when a docs page has no visual. Every page explains its idea with at
 * least one picture: a diagram component, a live demo or playground, the API
 * index or the home page's hero.
 *
 * Run with `npm run check:visuals -w minuta-docs`.
 */
import { readFileSync, readdirSync } from "node:fs";
import type { Dirent } from "node:fs";
import path from "node:path";

const CONTENT = path.resolve(import.meta.dirname, "../src/content/docs");
const PAGE = /\.mdx?$/u;
const VISUAL =
  /<(?:Timeline|MonthGrid|FieldDiagram|ParseDiagram|Anatomy|Flow|StackIsometric|ApiIndex|\w+Demo|\w+Playground)\b|^template: splash$/mu;
const FAILURE = 1;
const NONE = 0;

const missing = readdirSync(CONTENT, { recursive: true, withFileTypes: true })
  .filter(
    (dirent: Readonly<Dirent>) => dirent.isFile() && PAGE.test(dirent.name)
  )
  .map((dirent: Readonly<Dirent>) => path.join(dirent.parentPath, dirent.name))
  .filter((page) => !VISUAL.test(readFileSync(page, "utf8")))
  .map((page) => path.relative(CONTENT, page));

if (missing.length > NONE) {
  process.stderr.write(
    `${String(missing.length)} pages have no visual:\n  ${missing.join("\n  ")}\n`
  );
  process.exitCode = FAILURE;
} else {
  process.stdout.write("Every page has a visual.\n");
}
