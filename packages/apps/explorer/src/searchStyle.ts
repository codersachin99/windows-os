/**
 * Pinned legacy-win7/src/modules/runtime/vue-app.js explorerSearch map
 * (webpack module f3ad). The source theme resolver uses regex-like keys.
 * Default "win7" is NOT a classic search surface: it uses the main Explorer
 * search input, rather than XP Companion, Win95 Find or Win31 dialog.
 */
export type SourceExplorerSearchStyle = "companion" | "find" | "dialog" | null;

/** Pinned Computer uses window-addressbar-search instant for non-classic
 * themes. bin.js renders the same Computer component at hoistedPath=trashPath,
 * so the search slot is inherited by Recycle Bin too. Other theme chrome
 * remains migration-era until independently source-verified.
 *
 * Original computer.js uses webpack module 1902's default 300ms delay. */
export const SOURCE_INSTANT_SEARCH_DELAY_MS = 300;

export function sourceWin7InstantSearch(theme: string, _recycleBin: boolean): boolean {
  return theme === "win7";
}


export function sourceExplorerSearchStyle(theme: string): SourceExplorerSearchStyle {
  if (/^winxp|^winL|winW|win2k/.test(theme)) return "companion";
  if (/win95|win98/.test(theme)) return "find";
  if (theme === "win31") return "dialog";
  return null;
}
