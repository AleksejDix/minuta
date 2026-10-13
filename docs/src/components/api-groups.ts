/**
 * The reference's groups, one per entry point: the folder under `api/` and
 * the label. The sidebar and the API index page both read this list.
 */
const API_GROUPS: readonly (readonly [string, string])[] = [
  ["minuta", "minuta"],
  ["minuta-core", "minuta/core"],
  ["minuta-calendar", "minuta/calendar"],
  ["minuta-intervals", "minuta/intervals"],
  ["minuta-format", "minuta/format"],
  ["adapters", "Date engines"],
  ["minuta-react", "minuta-react"],
  ["minuta-vue", "minuta-vue"],
  ["datefield", "datefield"],
  ["input-dom", "input-dom"],
  ["input-state", "input-state"],
  ["text-buffer", "text-buffer"],
  ["fechita", "fechita"],
];

export { API_GROUPS };
