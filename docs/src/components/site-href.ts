/**
 * Links that work wherever a page is opened: under the site's base path,
 * with or without a trailing slash in the address.
 */

const EXTERNAL = /^[a-z]+:/u;
const TRAILING_SLASH = /\/$/u;
const LEADING_SLASH = /^\//u;

/**
 * A link to a page of the site, relative to the site's root.
 *
 * @example
 * siteHref("getting-started/"); // → "/minuta/getting-started/"
 *
 * @param link - A path inside the site, or an external URL
 * @returns The path under the base path, or the external URL as it is
 */
function siteHref(link: string): string {
  if (EXTERNAL.test(link)) {
    return link;
  }
  const base = import.meta.env.BASE_URL.replace(TRAILING_SLASH, "");
  return `${base}/${link.replace(LEADING_SLASH, "")}`;
}

export { siteHref };
