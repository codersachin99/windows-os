/** Source src/modules/apps/stickynotes.js keeps note records in
 * the Guest-specific "sticky" config as {notes:[{x,y,w,h,color,content}]}.
 * The transient React id is NOT persisted so saved records match the source.
 */
export const STICKY_COLORS = ["blue", "green", "pink", "purple", "white", "yellow"] as const;
export type StickyColor = typeof STICKY_COLORS[number];
export const STICKY_STORAGE_KEY = "windows-os:legacy-sticky:guest:v1";
export interface StickyRecord {
  x: number; y: number; w: number; h: number;
  color: StickyColor; content: string;
}
export interface StickyNote extends StickyRecord { id: number }
export interface StickyViewport { width: number; height: number }
export type StickyStorage = Pick<Storage, "getItem" | "setItem">;

export function sourceStickyDefault(viewport: StickyViewport, color: StickyColor = "yellow"): StickyRecord {
  const w = Math.min(200, Math.max(1, viewport.width));
  const h = Math.min(200, Math.max(1, viewport.height - 40));
  return {
    x: Math.max(0, (viewport.width - w) / 2),
    y: Math.max(0, Math.min((viewport.height - h) / 2, viewport.height - 40 - h)),
    w, h, color, content: ""
  };
}
export function sourceStickyRandomColor(random = Math.random): StickyColor {
  return STICKY_COLORS[Math.min(STICKY_COLORS.length - 1,
    Math.max(0, Math.floor(random() * STICKY_COLORS.length)))];
}
export function clampSourceSticky(note: StickyRecord, viewport: StickyViewport): StickyRecord {
  const w = Math.max(Math.min(150, viewport.width),
    Math.min(note.w, viewport.width));
  const available = Math.max(1, viewport.height - 40);
  const h = Math.max(Math.min(100, available), Math.min(note.h, available));
  return { ...note, w, h,
    x: Math.max(0, Math.min(note.x, viewport.width - w)),
    y: Math.max(0, Math.min(note.y, available - h)) };
}
export function sourceStickyMove(note: StickyRecord, dx: number, dy: number, viewport: StickyViewport): StickyRecord {
  return clampSourceSticky({ ...note, x: note.x + dx, y: note.y + dy }, viewport);
}
export type StickyResizeEdge = "n"|"s"|"e"|"w"|"ne"|"nw"|"se"|"sw";
export function sourceStickyResize(
  note: StickyRecord, edge: StickyResizeEdge, dx: number, dy: number,
  viewport: StickyViewport
): StickyRecord {
  const base = clampSourceSticky(note, viewport);
  const availableHeight = Math.max(1, viewport.height - 40);
  const minWidth = Math.min(150, viewport.width);
  const minHeight = Math.min(100, availableHeight);
  let {x,y,w,h} = base;
  if (edge.includes("e")) w = Math.max(minWidth, Math.min(w + dx, viewport.width - x));
  if (edge.includes("s")) h = Math.max(minHeight, Math.min(h + dy, availableHeight - y));
  if (edge.includes("w")) {
    const right = x + w;
    x = Math.max(0, Math.min(x + dx, right - minWidth));
    w = right - x;
  }
  if (edge.includes("n")) {
    const bottom = y + h;
    y = Math.max(0, Math.min(y + dy, bottom - minHeight));
    h = bottom - y;
  }
  return { ...base, x, y, w, h };
}
export function sourceStickyRecords(notes: readonly StickyNote[]): StickyRecord[] {
  return notes.map(({ x, y, w, h, color, content }) => ({ x, y, w, h, color, content }));
}
export function loadSourceStickyNotes(
  storage: Pick<StickyStorage, "getItem"> | undefined, viewport: StickyViewport
): StickyNote[] {
  const raw = storage?.getItem(STICKY_STORAGE_KEY);
  if (raw == null) return [{ ...sourceStickyDefault(viewport), id: 1 }];
  let stored: unknown;
  try { stored = JSON.parse(raw); } catch {
    throw new Error("Stored Sticky Notes data cannot be loaded");
  }
  if (!stored || typeof stored !== "object" || !("notes" in stored)
    || !Array.isArray(stored.notes)) {
    throw new Error("Stored Sticky Notes data cannot be loaded");
  }
  const notes: StickyRecord[] = stored.notes;
  const validated = notes.map((record, index) => {
    if (!record || typeof record !== "object"
      || ![record.x,record.y,record.w,record.h].every(v=>typeof v==="number"&&Number.isFinite(v))
      || record.w<=0 || record.h<=0 || typeof record.content!=="string"
      || !STICKY_COLORS.includes(record.color)) {
      throw new Error("Stored Sticky Notes data cannot be loaded");
    }
    return { ...clampSourceSticky(record,viewport), id: index+1 };
  });
  // Source watcher opens a new yellow note when persisted source notes are empty.
  return validated.length ? validated : [{ ...sourceStickyDefault(viewport), id: 1 }];
}
export function saveSourceStickyNotes(storage: StickyStorage | undefined, notes: readonly StickyNote[]): void {
  storage?.setItem(STICKY_STORAGE_KEY, JSON.stringify({ notes: sourceStickyRecords(notes) }));
}
