/**
 * Pinned legacy-win7/src/modules/runtime/vue-app.js explorerSearch map
 * (webpack module f3ad). The source theme resolver uses regex-like keys.
 * Default "win7" is NOT a classic search surface: it uses the main Explorer
 * search input, rather than XP Companion, Win95 Find or Win31 dialog.
 */
export type SourceExplorerSearchStyle = "companion" | "find" | "dialog" | null;

/** Pinned Computer uses window-addressbar-search instant for non-classic
 * themes. The Win7 slice is migrated first; leave other themes' interim
 * explicit Find control until their complete search chrome is reviewed. */
export function sourceWin7InstantSearch(theme: string, recycleBin: boolean): boolean {
  return theme === "win7" && !recycleBin;
}


export function sourceExplorerSearchStyle(theme: string): SourceExplorerSearchStyle {
  if (/^winxp|^winL|winW|win2k/.test(theme)) return "companion";
  if (/win95|win98/.test(theme)) return "find";
  if (theme === "win31") return "dialog";
  return null;
}
