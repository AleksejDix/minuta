/**
 * Fails when a page of the built site links to a page or an anchor that does
 * not exist. Resolves every internal `href` the way a browser does, under the
 * site's base path, so relative links are checked too.
 *
 * Run after the build with `npm run check:links -w minuta-docs`.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import type { Dirent } from "node:fs";
import path from "node:path";

const DIST = path.resolve(import.meta.dirname, "../dist");
const BASE = "/minuta/";
const ORIGIN = "https://docs.invalid";
const INDEX = "index.html";
const FAILURE = 1;
const NONE = 0;
const HASH_MARK = 1;
const SKIPPED = /^(?:[a-z]+:|\/\/)/u;
const ASSET = /\.(?:css|ico|js|json|png|svg|txt|webmanifest|xml)$/u;

function htmlFiles(): string[] {
  return readdirSync(DIST, { recursive: true, withFileTypes: true })
    .filter(
      (dirent: Readonly<Dirent>) =>
        dirent.isFile() && dirent.name.endsWith(".html")
    )
    .map((dirent: Readonly<Dirent>) =>
      path.join(dirent.parentPath, dirent.name)
    );
}

// The URL of a built page, e.g. /minuta/api/minuta/divide/
function pageUrl(file: string): string {
  const dir = path.relative(DIST, path.dirname(file)).split(path.sep).join("/");
  if (dir === "") {
    return BASE;
  }
  return `${BASE}${dir}/`;
}

function targetFile(pathname: string): string {
  const inside = decodeURIComponent(pathname.slice(BASE.length));
  if (inside === "" || inside.endsWith("/")) {
    return path.join(DIST, inside, INDEX);
  }
  return path.join(DIST, inside);
}

function hasAnchor(html: string, hash: string): boolean {
  const id = decodeURIComponent(hash.slice(HASH_MARK));
  return html.includes(`id="${id}"`);
}

function anchorProblem(
  target: string,
  page: Readonly<{ file: string; html: string }>,
  hash: string
): string | undefined {
  let targetHtml = page.html;
  if (target !== page.file) {
    targetHtml = readFileSync(target, "utf8");
  }
  if (hasAnchor(targetHtml, hash)) {
    return undefined;
  }
  return "no such anchor";
}

// Why a link is broken, or undefined when it is fine
function problem(href: string, file: string, html: string): string | undefined {
  const url = new URL(href, `${ORIGIN}${pageUrl(file)}`);
  if (!url.pathname.startsWith(BASE)) {
    return "outside the site's base path";
  }
  const target = targetFile(url.pathname);
  if (!existsSync(target)) {
    return "no such page";
  }
  if (url.hash === "" || ASSET.test(url.pathname)) {
    return undefined;
  }
  return anchorProblem(target, { file, html }, url.hash);
}

function hrefs(html: string): string[] {
  const found: string[] = [];
  for (const match of html.matchAll(/href="(?<href>[^"]+)"/gu)) {
    const { href } = match.groups ?? {};
    if (href !== undefined) {
      found.push(href);
    }
  }
  return found;
}

function brokenLinks(file: string): string[] {
  const html = readFileSync(file, "utf8");
  return hrefs(html)
    .filter((href) => !SKIPPED.test(href))
    .flatMap((href) => {
      const why = problem(href, file, html);
      if (why === undefined) {
        return [];
      }
      return [`${pageUrl(file)} → ${href} (${why})`];
    });
}

const broken = [...new Set(htmlFiles().flatMap((file) => brokenLinks(file)))];
if (broken.length > NONE) {
  process.stderr.write(
    `${String(broken.length)} broken links:\n  ${broken.join("\n  ")}\n`
  );
  process.exitCode = FAILURE;
} else {
  process.stdout.write("Every internal link resolves.\n");
}
