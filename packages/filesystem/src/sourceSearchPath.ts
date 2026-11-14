import { normalizeFileUri } from "./index";

/**
 * Pinned legacy webpack 5401.k -> "shell:search", plus 2e2c.f/d:
 * shell:search?q=<query>&in=<scope>[&name=<pattern>][&sub=0].
 * This is a VIRTUAL shell path, never a host or Guest filesystem URI.
 */
export const SOURCE_SEARCH_URI_PREFIX = "shell:search";

export interface SourceSearchPath {
  text: string;
  /** A null/blank scope instructs the source to search all mounted disks. */
  scope: string | null;
  /** Null omits the name= parameter; empty string emits name=. */
  namePattern: string | null;
  subfolders: boolean;
}

export function encodeSourceSearchPath(query: SourceSearchPath): string {
  const params = new URLSearchParams({ q: query.text, in: query.scope || "" });
  if (query.namePattern !== null) params.set("name", query.namePattern);
  if (!query.subfolders) params.set("sub", "0");
  return SOURCE_SEARCH_URI_PREFIX + "?" + params;
}
export function isSourceSearchPath(path: string | undefined): boolean {
  return Boolean(path?.startsWith(SOURCE_SEARCH_URI_PREFIX + "?"));
}
export function decodeSourceSearchPath(path: string | undefined): SourceSearchPath | null {
  if (!isSourceSearchPath(path)) return null;
  try {
    const params = new URLSearchParams(path!.slice(SOURCE_SEARCH_URI_PREFIX.length + 1));
    const scope = params.get("in") || null;
    // Original virtual route may reference a scoped disk, but the Guest VFS
    // must reject non-canonical and non-absolute paths before normalization.
    if (scope && (!scope.startsWith("/") || normalizeFileUri(scope) !== scope)) return null;
    return {
      text: params.get("q") || "", scope,
      namePattern: params.has("name") ? params.get("name") : null,
      subfolders: params.get("sub") !== "0"
    };
  } catch { return null; }
}
