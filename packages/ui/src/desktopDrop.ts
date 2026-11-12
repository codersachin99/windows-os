import type { DesktopPoint } from "./desktopPositions";

/** Source desktop pointer drag: hit the visible Bin icon, not a guessed disk. */
export function hitDesktopRecycleBin(
  pointer: DesktopPoint,
  bounds: Pick<DOMRect, "left" | "right" | "top" | "bottom">
): boolean {
  return Number.isFinite(pointer.x) && Number.isFinite(pointer.y)
    && pointer.x >= bounds.left && pointer.x <= bounds.right
    && pointer.y >= bounds.top && pointer.y <= bounds.bottom;
}
