/**
 * Original desktop selection references:
 * legacy-win7/src/modules/system/main.js desktop component:
 * handlePointerDown -> pressIcon(event) || startBand(event).
 * Its band DOM is desktop__icon-band; getBandArea, bandItemSelector,
 * getBandSelection/setBandSelection are provided to the original band mixin.
 *
 * Rectangle selection is in source desktop-local CSS pixels (not screen
 * coordinates) and never mutates persisted icon positions.
 */
import {
  positionForIcon, SOURCE_DESKTOP_ICON_SIZES,
  type DesktopArea, type DesktopPoint, type DesktopPositionSnapshot
} from "./desktopPositions";

export interface DesktopBand {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function desktopBand(
  start: DesktopPoint, end: DesktopPoint, area: DesktopArea
): DesktopBand {
  const x1 = Math.max(0, Math.min(area.width, start.x));
  const x2 = Math.max(0, Math.min(area.width, end.x));
  const y1 = Math.max(0, Math.min(area.height, start.y));
  const y2 = Math.max(0, Math.min(area.height, end.y));
  return {
    left: Math.min(x1,x2), top: Math.min(y1,y2),
    width: Math.abs(x2-x1), height: Math.abs(y2-y1)
  };
}
export function desktopBandHits(
  items: readonly { id: string; index: number }[],
  band: DesktopBand, options: DesktopPositionSnapshot, area: DesktopArea
): string[] {
  if (!options.showIcons || band.width === 0 || band.height === 0) return [];
  const size = SOURCE_DESKTOP_ICON_SIZES[options.iconSize];
  return items.filter(item => {
    const p = positionForIcon(item.index, options.positions[item.id], options, area);
    return p.x < band.left + band.width &&
      p.x + size > band.left &&
      p.y < band.top + band.height &&
      p.y + size > band.top;
  }).map(item => item.id);
}
export type DesktopBandModifier = "replace" | "add" | "toggle";
export function desktopBandSelection(
  previous: readonly string[], hits: readonly string[],
  mode: DesktopBandModifier
): string[] {
  const selected = new Set(previous);
  if (mode === "replace") return [...hits];
  if (mode === "add") {
    for (const key of hits) selected.add(key);
  } else {
    for (const key of hits) {
      if (selected.has(key)) selected.delete(key);
      else selected.add(key);
    }
  }
  return [...selected];
}
