/**
 * Source: legacy-win7/src/modules/system/main.js modules c5f4 and desktop
 * drag mixin at main.js ~42k, and Vuex desktop module 743b.
 *
 * Original desktop icon sizes: sm=50, md=80, lg=120.
 * Desktop items use persisted pixel x/y (ShortcutMove) unless autoIcons=true.
 * Default positioning fills a column before moving to the next column.
 */
export type DesktopIconSize = "sm" | "md" | "lg";
export interface DesktopPoint { x: number; y: number }
export interface DesktopArea { width: number; height: number }
export interface DesktopPositionSnapshot {
  iconSize: DesktopIconSize;
  autoArrange: boolean;
  showIcons: boolean;
  positions: Record<string, DesktopPoint>;
}
export interface DesktopPositionStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
export const SOURCE_DESKTOP_ICON_SIZES: Readonly<Record<DesktopIconSize, number>> =
  Object.freeze({ sm: 50, md: 80, lg: 120 });
export const SOURCE_DESKTOP_DRAG_THRESHOLD = 4;
export const GUEST_DESKTOP_POSITION_KEY = "windows-os:desktop-layout:guest:v1";

const fresh = (): DesktopPositionSnapshot => ({
  iconSize: "md", autoArrange: false, showIcons: true, positions: {}
});
const safePoint = (value: unknown): value is DesktopPoint =>
  !!value && typeof value === "object"
  && Number.isFinite((value as DesktopPoint).x)
  && Number.isFinite((value as DesktopPoint).y)
  && (value as DesktopPoint).x >= 0
  && (value as DesktopPoint).y >= 0;

function restore(text: string | null): DesktopPositionSnapshot {
  if (!text) return fresh();
  try {
    const state: unknown = JSON.parse(text);
    if (!state || typeof state !== "object") return fresh();
    const item = state as Record<string, unknown>;
    if (item.version !== 1 || !["sm","md","lg"].includes(String(item.iconSize))
      || typeof item.autoArrange !== "boolean" || typeof item.showIcons !== "boolean"
      || !item.positions || typeof item.positions !== "object" || Array.isArray(item.positions)) {
      return fresh();
    }
    const positions: Record<string, DesktopPoint> = {};
    for (const [id, point] of Object.entries(item.positions)) {
      if (id !== "__proto__" && id !== "constructor" && safePoint(point)) {
        positions[id] = { x: point.x, y: point.y };
      }
    }
    return {
      iconSize: item.iconSize as DesktopIconSize,
      autoArrange: item.autoArrange,
      showIcons: item.showIcons,
      positions
    };
  } catch { return fresh(); }
}

function limited(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

export function positionForIcon(
  index: number, stored: DesktopPoint | undefined,
  options: DesktopPositionSnapshot,
  area: DesktopArea
): DesktopPoint {
  const size = SOURCE_DESKTOP_ICON_SIZES[options.iconSize];
  const rows = Math.max(1, Math.floor(Math.max(0, area.height) / size) - 1);
  const defaultPosition = {
    x: Math.floor(index / rows) * size,
    y: (index % rows) * size
  };
  const original = options.autoArrange ? defaultPosition : stored ?? defaultPosition;
  // Preserve the saved absolute position; only clamp its visible projection
  // when the viewport shrinks, so an expanded screen restores the original.
  return {
    x: limited(original.x, 0, Math.max(0, area.width - size)),
    y: limited(original.y, 0, Math.max(0, area.height - size))
  };
}

export function boundedIconDrag(
  points: readonly DesktopPoint[], area: DesktopArea,
  size: number, requested: DesktopPoint
): DesktopPoint {
  if (!points.length) return { x: 0, y: 0 };
  const left = Math.min(...points.map(p => p.x));
  const top = Math.min(...points.map(p => p.y));
  const right = Math.max(...points.map(p => p.x + size));
  const bottom = Math.max(...points.map(p => p.y + size));
  const minDx = -left, maxDx = area.width - right;
  const minDy = -top, maxDy = area.height - bottom;
  return {
    x: Math.round(limited(requested.x, minDx, Math.max(minDx, maxDx))),
    y: Math.round(limited(requested.y, minDy, Math.max(minDy, maxDy)))
  };
}

/** Guest scoped browser store; persisted after icon drop, not per pointermove. */
export class DesktopPositionStore {
  private state: DesktopPositionSnapshot;
  constructor(
    private readonly storage?: DesktopPositionStorage,
    private readonly key = GUEST_DESKTOP_POSITION_KEY
  ) {
    this.state = restore(storage?.getItem(key) ?? null);
  }
  snapshot(): DesktopPositionSnapshot {
    return {
      ...this.state,
      positions: Object.fromEntries(
        Object.entries(this.state.positions).map(([key, value]) =>
          [key, { ...value }])
      )
    };
  }
  private commit(next: DesktopPositionSnapshot): void {
    this.storage?.setItem(this.key, JSON.stringify({ version: 1, ...next }));
    this.state = next;
  }
  setIconSize(iconSize: DesktopIconSize): void {
    if (!(iconSize in SOURCE_DESKTOP_ICON_SIZES)) return;
    this.commit({ ...this.state, iconSize });
  }
  setAutoArrange(autoArrange: boolean): void {
    this.commit({ ...this.state, autoArrange });
  }
  setShowIcons(showIcons: boolean): void {
    this.commit({ ...this.state, showIcons });
  }
  /** Preserve a manually placed file icon across the source FileRename path. */
  rekey(oldId: string, newId: string): void {
    if (oldId === newId || !Object.hasOwn(this.state.positions, oldId)) return;
    const positions = { ...this.state.positions };
    const point = positions[oldId];
    delete positions[oldId];
    positions[newId] = point;
    this.commit({ ...this.state, positions });
  }
  placement(id: string, index: number, area: DesktopArea): DesktopPoint {
    return positionForIcon(index, this.state.positions[id], this.state, area);
  }
  move(
    entries: readonly { id: string; index: number }[],
    area: DesktopArea,
    offset: DesktopPoint
  ): DesktopPoint {
    if (!entries.length || this.state.autoArrange) return { x: 0, y: 0 };
    const size = SOURCE_DESKTOP_ICON_SIZES[this.state.iconSize];
    const initial = entries.map(entry => this.placement(entry.id, entry.index, area));
    const delta = boundedIconDrag(initial, area, size, offset);
    if (delta.x === 0 && delta.y === 0) return delta;
    const positions = { ...this.state.positions };
    entries.forEach((entry, i) => {
      positions[entry.id] = { x: initial[i].x + delta.x, y: initial[i].y + delta.y };
    });
    this.commit({ ...this.state, positions });
    return delta;
  }
}
