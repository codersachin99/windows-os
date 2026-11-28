/**
 * Backwards-compatible Explorer adapter to the shared Desktop/Explorer/Bin
 * source BaseMenu cascade. Keep this export so previous Explorer contracts,
 * tests and callers remain unchanged while all menus share one geometry rule.
 */
export {
  sourceCascadingSubmenuPlacement as sourceExplorerSubmenuPlacement
} from "@windows-os/ui/menu-cascade";
export type {
  SourceCascadeRect as SourceMenuRect,
  SourceCascadePlacement as SourceSubmenuPlacement
} from "@windows-os/ui/menu-cascade";
