/**
 * Pinned legacy-win7/src/modules/runtime/vue-app.js explorerSearch map
 * (webpack module f3ad). The source theme resolver uses regex-like keys.
 * Default "win7" is NOT a classic search surface: it uses the main Explorer
 * search input, rather than XP Companion, Win95 Find or Win31 dialog.
 */
export type SourceExplorerSearchStyle = "companion" | "find" | "dialog" | null;

export function sourceExplorerSearchStyle(theme: string): SourceExplorerSearchStyle {
  if (/^winxp|^winL|winW|win2k/.test(theme)) return "companion";
  if (/win95|win98/.test(theme)) return "find";
  if (theme === "win31") return "dialog";
  return null;
}
