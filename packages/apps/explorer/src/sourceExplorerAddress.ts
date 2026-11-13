import type { LegacyPathConfig } from "@windows-os/filesystem";
import { sourceComputerBreadcrumbs, type SourceBreadcrumb } from "./SourceWin7Breadcrumbs";

/**
 * Original legacy-win7/src/modules/apps/computer.js:
 * location() returns [search-results] for classic Find and
 * [search-results-in(searchLocation)] for normal shell:search.
 * searchLocation() is the last label returned by getLocation(searchScope).
 *
 * In React the session.path is the mounted scope (not the shell:search URI).
 * Do not turn the virtual results label into a clickable filesystem URI.
 * The default English text is pinned to assets/locales/en-US.json.
 */
export function sourceExplorerAddressBreadcrumbs(
  path: string,
  config?: Pick<LegacyPathConfig, "root" | "drives"> | null,
  trashPath?: string | null,
  searching = false,
  classicFind = false
): SourceBreadcrumb[] {
  const normal = sourceComputerBreadcrumbs(path, config, trashPath);
  if (!searching) return normal;
  if (classicFind) return [{ label: "Search Results", path: null }];
  const location = normal[normal.length - 1]?.label ?? "Computer";
  return [{ label: "Search Results in " + location, path: null }];
}
