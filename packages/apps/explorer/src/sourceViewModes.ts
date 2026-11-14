import type { ExplorerViewMode } from "./model";

/** Original Computer view-mode menu uses eight slots (slider 0..7).
 * Labels correspond to pinned legacy en-US.json (xl/lg/md/sm-icons,
 * list, details, tiles and content). Keep this one canonical order
 * for the menu and its slider.
 */
export const SOURCE_VIEW_MODES: ReadonlyArray<{
  value: ExplorerViewMode;
  label: string;
  sourceKey: string;
}> = [
  { value: "extra-large-icons", label: "Extra large icons", sourceKey: "xl-icons" },
  { value: "large-icons", label: "Large icons", sourceKey: "lg-icons" },
  { value: "medium-icons", label: "Medium icons", sourceKey: "md-icons" },
  { value: "small-icons", label: "Small icons", sourceKey: "sm-icons" },
  { value: "list", label: "List", sourceKey: "list" },
  { value: "details", label: "Details", sourceKey: "details" },
  { value: "tiles", label: "Tiles", sourceKey: "tiles" },
  { value: "content", label: "Content", sourceKey: "content" }
];

export function sourceViewModeIndex(value: ExplorerViewMode): number {
  return Math.max(0, SOURCE_VIEW_MODES.findIndex(mode => mode.value === value));
}

export function sourceViewModeAt(index: number): ExplorerViewMode {
  const bounded = Number.isFinite(index)
    ? Math.max(0, Math.min(SOURCE_VIEW_MODES.length - 1, Math.trunc(index))) : 0;
  return SOURCE_VIEW_MODES[bounded]?.value ?? "details";
}
