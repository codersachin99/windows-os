/** Pinned legacy-win7 IE (webpack 1386), app.config.json endpoints. */
export const SOURCE_IE_HOME = "https://msn.com";
export const SOURCE_IE_SEARCH = "https://bing.com/search?q=";
export const SOURCE_IE_MENUS = ["Favorites", "Bookmarks"] as const;
export interface SourceIEHistory { urls: readonly string[]; index: number }
export const emptySourceIEHistory: SourceIEHistory = { urls: [], index: -1 };

export function normalizeSourceIEAddress(raw: string): string | null {
  const value = raw.trim();
  if (!value || value.startsWith("//") || /\s/.test(value)) return null;
  if (/^[a-z][a-z\d+.-]*:/i.test(value) && !/^https?:\/\//i.test(value)) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : "https://" + value);
    return ["http:", "https:"].includes(url.protocol) && url.hostname &&
      !url.username && !url.password ? url.href : null;
  } catch { return null; }
}
export function sourceIESearchUrl(query: string): string | null {
  const q = query.trim();
  return q ? SOURCE_IE_SEARCH + encodeURIComponent(q) : null;
}
export function pushSourceIEHistory(old: SourceIEHistory, url: string): SourceIEHistory {
  return { urls: [...old.urls.slice(0, old.index + 1), url], index: old.index + 1 };
}
export function stepSourceIEHistory(old: SourceIEHistory, direction: "back" | "next"):
  { history: SourceIEHistory; url: string } | null {
  const index = old.index + (direction === "back" ? -1 : 1);
  return index < 0 || index >= old.urls.length ? null
    : { history: { urls: old.urls, index }, url: old.urls[index] };
}
