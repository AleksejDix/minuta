/**
 * Fails when a page of the built site would look wrong to a search engine:
 * a missing, duplicate or overlong `<title>`, a missing or badly sized
 * description, JSON-LD that does not parse, or a breadcrumb that points to
 * no page. The 404 page only needs `noindex`.
 *
 * Run after the build with `npm run check:seo -w minuta-docs`.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import type { Dirent } from "node:fs";
import path from "node:path";

type Page = Readonly<{
  description: string;
  file: string;
  html: string;
  title: string;
}>;

const DIST = path.resolve(import.meta.dirname, "../dist");
const BASE = "/minuta/";
const INDEX = "index.html";
const NOT_FOUND = "404.html";
const FAILURE = 1;
const NONE = 0;
// Where search results cut titles and descriptions off
const MAX_TITLE = 60;
const MIN_DESCRIPTION = 50;
const MAX_DESCRIPTION = 160;
const TITLE = /<title>(?<title>[^<]*)<\/title>/u;
const DESCRIPTION = /<meta name="description" content="(?<description>[^"]*)"/u;
const JSON_LD_OPEN = '<script type="application/ld+json">';
const SCRIPT_CLOSE = "</script>";
// The text before the first script is not JSON-LD
const AFTER_FIRST = 1;
const NOINDEX = /<meta content="noindex" name="robots"/u;
const ENTITY = /&(?<name>amp|lt|gt|quot|#39);/gu;
const ENTITIES: Readonly<Record<string, string>> = {
  "#39": "'",
  amp: "&",
  gt: ">",
  lt: "<",
  quot: '"',
};

function decoded(text: string): string {
  return text.replaceAll(
    ENTITY,
    (_match, name: string) => ENTITIES[name] ?? ""
  );
}

function htmlFiles(): string[] {
  return readdirSync(DIST, { recursive: true, withFileTypes: true })
    .filter(
      (dirent: Readonly<Dirent>) =>
        dirent.isFile() &&
        dirent.name.endsWith(".html") &&
        !dirent.parentPath.includes("pagefind")
    )
    .map((dirent: Readonly<Dirent>) =>
      path.join(dirent.parentPath, dirent.name)
    );
}

// The named group of the first match of `pattern`, or ""
function captured(
  html: string,
  pattern: Readonly<RegExp>,
  name: string
): string {
  const match = pattern.exec(html);
  if (match === null || match.groups === undefined) {
    return "";
  }
  return decoded(match.groups[name] ?? "");
}

function pageOf(file: string): Page {
  const html = readFileSync(file, "utf8");
  return {
    description: captured(html, DESCRIPTION, "description"),
    file: path.relative(DIST, file),
    html,
    title: captured(html, TITLE, "title"),
  };
}

// The built page a breadcrumb URL names, if any
function crumbExists(url: unknown): boolean {
  if (typeof url !== "string") {
    return false;
  }
  const { pathname } = new URL(url);
  if (!pathname.startsWith(BASE)) {
    return false;
  }
  return existsSync(path.join(DIST, pathname.slice(BASE.length), INDEX));
}

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null;
}

// The `item` URLs of a BreadcrumbList, none for other JSON-LD
function crumbUrls(data: unknown): unknown[] {
  if (!isRecord(data) || !Array.isArray(data["itemListElement"])) {
    return [];
  }
  return data["itemListElement"].flatMap((crumb: unknown) => {
    if (!isRecord(crumb)) {
      return [];
    }
    return [crumb["item"]];
  });
}

// The JSON inside each <script type="application/ld+json">
function jsonLdBlocks(html: string): string[] {
  return html
    .split(JSON_LD_OPEN)
    .slice(AFTER_FIRST)
    .map((part) => part.slice(NONE, part.indexOf(SCRIPT_CLOSE)));
}

function structuredDataProblems(page: Page): string[] {
  return jsonLdBlocks(page.html).flatMap((json) => {
    try {
      const data: unknown = JSON.parse(json);
      return crumbUrls(data)
        .filter((url) => !crumbExists(url))
        .map((url) => `breadcrumb to no page: ${String(url)}`);
    } catch {
      return ["JSON-LD does not parse"];
    }
  });
}

function problemsOf(page: Page): string[] {
  if (page.file === NOT_FOUND) {
    if (NOINDEX.test(page.html)) {
      return [];
    }
    return ["no noindex"];
  }
  const problems: string[] = [];
  if (page.title === "" || page.title.length > MAX_TITLE) {
    problems.push(
      `title of ${String(page.title.length)} characters: "${page.title}"`
    );
  }
  if (
    page.description.length < MIN_DESCRIPTION ||
    page.description.length > MAX_DESCRIPTION
  ) {
    problems.push(
      `description of ${String(page.description.length)} characters`
    );
  }
  return [...problems, ...structuredDataProblems(page)];
}

function duplicateTitles(pages: readonly Page[]): string[] {
  const seen = new Map<string, string>();
  return pages.flatMap((page) => {
    const first = seen.get(page.title);
    seen.set(page.title, page.file);
    if (first === undefined || page.file === NOT_FOUND) {
      return [];
    }
    return [`${page.file}: same title as ${first}: "${page.title}"`];
  });
}

const pages = htmlFiles().map((file) => pageOf(file));
const problems = [
  ...pages.flatMap((page) =>
    problemsOf(page).map((problem) => `${page.file}: ${problem}`)
  ),
  ...duplicateTitles(pages),
];
if (problems.length > NONE) {
  process.stderr.write(
    `${String(problems.length)} SEO problems:\n  ${problems.join("\n  ")}\n`
  );
  process.exitCode = FAILURE;
} else {
  process.stdout.write(
    `${String(pages.length)} pages: titles, descriptions and structured data are fine.\n`
  );
}
