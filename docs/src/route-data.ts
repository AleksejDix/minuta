/**
 * Search-engine and link-preview details for every page, added at build
 * time: titles that say which package an API page belongs to, structured
 * data (JSON-LD) and `noindex` on the 404 page. Page headings and sidebar
 * labels stay as they are.
 */
import { API_GROUPS } from "./components/api-groups";
import type { StarlightRouteData } from "@astrojs/starlight/route-data";
import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

type HeadEntry = StarlightRouteData["head"][number];
type ReadonlyEntry = Readonly<
  Omit<HeadEntry, "attrs"> & {
    attrs?: Readonly<NonNullable<HeadEntry["attrs"]>> | undefined;
  }
>;
type Crumb = Readonly<{ name: string; path: string }>;
type Page = Readonly<{
  description: string | undefined;
  id: string;
  /** The site's address, e.g. `https://dix.consulting/minuta/` */
  root: string;
  title: string;
}>;

const SITE_NAME = "minuta";
const HOME = "";
const HOME_TITLE = "minuta — calendar library, date parser and date field";
const REPOSITORY = "https://github.com/AleksejDix/minuta";
const LICENSE = "https://www.apache.org/licenses/LICENSE-2.0";
const API = "api";
const OVERVIEW = "overview";
const NOT_FOUND = "404";
const SEPARATOR = "/";
const SECTION = 0;
const GROUP = 1;
const PAGE = 2;
const FIRST_POSITION = 1;

const GROUP_LABELS: ReadonlyMap<string, string> = new Map(API_GROUPS);

/**
 * The page's own title, saying which package an API page documents:
 * `useMinuta` exists in minuta-react and minuta-vue alike.
 *
 * @param id - The page's id, e.g. `api/minuta-react/use-minuta`
 * @param title - The page's title
 * @returns The title for `<title>` and `og:title`, without the site name
 */
function pageTitle(id: string, title: string): string {
  if (id === HOME) {
    return HOME_TITLE;
  }
  const parts = id.split(SEPARATOR);
  const label = GROUP_LABELS.get(parts.at(GROUP) ?? "");
  if (parts.at(SECTION) !== API || label === undefined) {
    return title;
  }
  if (parts.at(PAGE) === OVERVIEW) {
    return `${label} API reference`;
  }
  return `${title} · ${label}`;
}

/**
 * The crumbs between "API" and an API page: its package's overview.
 *
 * @param parts - The page's id, split at slashes
 * @returns The package's crumb, or none for the overview pages themselves
 */
function groupCrumbs(parts: readonly string[]): Crumb[] {
  const group = parts.at(GROUP) ?? "";
  const label = GROUP_LABELS.get(group);
  if (label === undefined || parts.at(PAGE) === OVERVIEW) {
    return [];
  }
  return [{ name: label, path: `${API}/${group}/${OVERVIEW}/` }];
}

/**
 * The trail from the home page to a page, for a BreadcrumbList.
 *
 * @param id - The page's id
 * @param title - The page's title
 * @returns The crumbs, the page itself last
 */
function crumbsOf(id: string, title: string): Crumb[] {
  const parts = id.split(SEPARATOR);
  const home: Crumb = { name: SITE_NAME, path: "" };
  const page: Crumb = { name: title, path: `${id}/` };
  if (parts.at(SECTION) !== API) {
    return [home, { name: "Guide", path: "introduction/" }, page];
  }
  return [home, { name: "API", path: `${API}/` }, ...groupCrumbs(parts), page];
}

function jsonLd(data: Readonly<Record<string, unknown>>): HeadEntry {
  return {
    attrs: { type: "application/ld+json" },
    // `<` would end the script early
    content: JSON.stringify(data).replaceAll("<", String.raw`<`),
    tag: "script",
  };
}

/**
 * The page's JSON-LD: the library on the home page, a breadcrumb trail on
 * every other page.
 *
 * @param page - The page
 * @returns A `<script type="application/ld+json">` entry
 */
function structuredData(page: Page): HeadEntry {
  if (page.id === HOME) {
    return jsonLd({
      "@context": "https://schema.org",
      "@type": "SoftwareSourceCode",
      codeRepository: REPOSITORY,
      description: page.description,
      license: LICENSE,
      name: SITE_NAME,
      programmingLanguage: "TypeScript",
      url: page.root,
    });
  }
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbsOf(page.id, page.title).map((crumb, index) => ({
      "@type": "ListItem",
      item: new URL(crumb.path, page.root).href,
      name: crumb.name,
      position: index + FIRST_POSITION,
    })),
  });
}

type AttrValue = NonNullable<HeadEntry["attrs"]>[string];

function propertyOf(entry: ReadonlyEntry): AttrValue {
  if (entry.attrs === undefined) {
    return undefined;
  }
  return entry.attrs["property"];
}

// The `<title>`: the home page's title already starts with the site name
function documentTitle(page: Page): string {
  const shown = pageTitle(page.id, page.title);
  if (page.id === HOME) {
    return shown;
  }
  return `${shown} | ${SITE_NAME}`;
}

// An Open Graph `<meta>` with new content
function openGraph(entry: ReadonlyEntry, content: string): HeadEntry {
  return {
    attrs: { content, property: propertyOf(entry) },
    content: entry.content,
    tag: entry.tag,
  };
}

/**
 * One `<head>` entry with the page's title, Open Graph title and, on the
 * home page, the `website` type.
 *
 * @param entry - A `<head>` entry Starlight made
 * @param page - The page
 * @returns The entry, updated when it is one of those
 */
function retitled(entry: ReadonlyEntry, page: Page): HeadEntry {
  const shown = pageTitle(page.id, page.title);
  if (entry.tag === "title") {
    return { attrs: entry.attrs, content: documentTitle(page), tag: entry.tag };
  }
  const property = propertyOf(entry);
  if (property === "og:title") {
    return openGraph(entry, shown);
  }
  if (property === "og:type" && page.id === HOME) {
    return openGraph(entry, "website");
  }
  return entry;
}

// oxlint-disable-next-line typescript/prefer-readonly-parameter-types -- Astro owns the context; Starlight expects route data to be set on it
const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  if (route.id === NOT_FOUND) {
    route.head.push({
      attrs: { content: "noindex", name: "robots" },
      tag: "meta",
    });
    return;
  }
  const page: Page = {
    description: route.entry.data.description,
    id: route.id,
    // BASE_URL has no trailing slash ("/minuta"); crumbs resolve against it
    root: new URL(`${import.meta.env.BASE_URL}/`, context.site).href,
    title: route.entry.data.title,
  };
  route.head = [
    ...route.head.map((entry: ReadonlyEntry) => retitled(entry, page)),
    structuredData(page),
  ];
});

export { onRequest };
