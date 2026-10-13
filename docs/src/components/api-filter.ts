/**
 * The API index's filter: hide the pages whose name does not contain the
 * text typed, and the groups left empty.
 */

/**
 * Show the pages of one group that match.
 *
 * @param group - The group's element
 * @param needle - The lowercase text to look for
 * @returns Whether any page of the group matches
 */
function filterGroup(group: HTMLElement, needle: string): boolean {
  let matches = false;
  for (const item of group.querySelectorAll<HTMLElement>("[data-api-name]")) {
    const match = (item.dataset["apiName"] ?? "").includes(needle);
    item.hidden = !match;
    matches ||= match;
  }
  group.hidden = !matches;
  return matches;
}

/**
 * Show the pages of every group that match, or a note when none do.
 *
 * @param root - The API index
 * @param query - The text typed into the filter
 */
function filterGroups(root: HTMLElement, query: string): void {
  const needle = query.trim().toLowerCase();
  const shown = [...root.querySelectorAll<HTMLElement>("[data-api-group]")]
    .map((group) => filterGroup(group, needle))
    .includes(true);
  const empty = root.querySelector<HTMLElement>("[data-api-empty]");
  if (empty !== null) {
    empty.hidden = shown;
  }
}

/**
 * Wire up every API index filter on the page.
 */
function mountApiFilters(): void {
  for (const root of document.querySelectorAll<HTMLElement>(
    "[data-api-index]"
  )) {
    const input = root.querySelector<HTMLInputElement>("[data-api-filter]");
    if (input !== null) {
      input.addEventListener("input", () => {
        filterGroups(root, input.value);
      });
    }
  }
}

export { mountApiFilters };
