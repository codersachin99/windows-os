import {
  FileStoreError, normalizeFileUri,
  type FileEntry, type VirtualFileStore
} from "./index";
import {
  compileSourceSearch, normalizeSourceSearchText, sourceSearchMatch,
  type SourceSearchHighlight
} from "./sourceTextSearch";

/**
 * The original Computer search tracks scope, namePattern and subfolders
 * (legacy src/modules/apps/computer.js -> listSearch/searchIndex.walk).
 * This first port scans real virtual paths; content indexing, result ranking
 * and legacy query operators are separate, not-yet-verified features.
 */
export interface FileSearchRequest {
  scope: string;
  text?: string;
  /** Source 2e2c.e ranking even for classic Find queries without text. */
  sourceRanked?: boolean;
  namePattern?: string | null;
  /** Original Find and Search Companion support comma/semicolon-separated patterns. */
  sourceNamePattern?: string;
  modifiedAfter?: number;
  modifiedBefore?: number;
  minSizeBytes?: number;
  maxSizeBytes?: number;
  kind?: "folder" | "document" | "picture" | "music" | "video" | "movie" | "playlist" | "program" | "link" | "webpage" | "text" | "image" | "audio" | "archive" | "application";
  subfolders?: boolean;
  skipPaths?: readonly string[];
  maxResults?: number;
}
export interface FileSearchProgress {
  foldersScanned: number;
  filesScanned: number;
  matches: number;
}
export interface FileSearchResult {
  files: FileEntry[];
  progress: FileSearchProgress;
  truncated: boolean;
  /** Source 2e2c.w matched token marks, indexed by Guest VFS URI only. */
  highlights?: Readonly<Record<string, readonly SourceSearchHighlight[]>>;
}

/** Case-insensitive filename wildcard matcher (? one char, * any run). */
export function matchFilePattern(name: string, pattern: string): boolean {
  // Quote any regular-expression metacharacter other than ? and *.
  const escaped = [...pattern].map(char =>
    char === "*" ? ".*" : char === "?" ? "." : char.replace(/[\\^$+.()|[\]{}]/g, "\\$&")).join("");
  return new RegExp("^" + escaped + "$", "iu").test(name);
}

/** Pinned Find/Companion module 16d5.c: substring terms or wildcard tokens. */
export function matchSourceNamePattern(name: string, sourcePattern: string): boolean {
  const terms = sourcePattern.split(/[;,]/).map(p =>
    normalizeSourceSearchText(p.trim())).filter(Boolean);
  if (!terms.length) return true;
  const lower = normalizeSourceSearchText(name);
  return terms.some(term => {
    if (!/[*?]/.test(term)) return lower.includes(term);
    if (term.endsWith(".*")) {
      const stem = term.slice(0, -2);
      return matchFilePattern(name, stem) || matchFilePattern(name, stem + ".*");
    }
    return matchFilePattern(name, term);
  });
}

/** Source file categories are filtered by their actual extension, not host MIME. */
export function matchesSourceKind(entry: FileEntry, kind: NonNullable<FileSearchRequest["kind"]>): boolean {
  if (kind === "folder") return entry.type === "directory";
  if (entry.type !== "file") return false;
  const extension = entry.name.split(".").pop()?.toLocaleLowerCase() ?? "";
  const kinds: Record<Exclude<NonNullable<FileSearchRequest["kind"]>, "folder">, readonly string[]> = {
    text: ["txt", "log", "ini", "csv"],
    image: ["bmp", "gif", "jpg", "jpeg", "png", "webp", "svg"],
    audio: ["aac", "flac", "m4a", "mp3", "ogg", "wav", "wma"],
    video: ["avi", "mkv", "mov", "mp4", "mpeg", "mpg", "webm", "wmv"],
    document: ["doc", "docx", "odt", "pdf", "rtf", "txt"],
    archive: ["7z", "gz", "rar", "tar", "zip"],
    application: ["bat", "cmd", "com", "exe", "msi"],
    picture: ["bmp", "gif", "ico", "jpeg", "jpg", "png", "svg", "webp"],
    music: ["aac", "flac", "m4a", "mp3", "ogg", "wav", "wma"],
    movie: ["avi", "mkv", "mov", "mp4", "mpeg", "mpg", "webm", "wmv"],
    playlist: ["m3u", "m3u8", "pls", "wpl"],
    program: ["bat", "cmd", "com", "exe", "msi"],
    link: ["lnk", "url"],
    webpage: ["htm", "html", "mht", "mhtml"]
  };
  return kinds[kind].includes(extension);
}

export async function searchFiles(
  filesystem: Pick<VirtualFileStore, "stat" | "list">,
  request: FileSearchRequest,
  options: { signal?: AbortSignal; onProgress?: (p: FileSearchProgress) => void } = {}
): Promise<FileSearchResult> {
  const scope = normalizeFileUri(request.scope);
  const entry = await filesystem.stat(scope);
  if (!entry) throw new FileStoreError("ENOENT", "Search location does not exist: " + scope);
  if (entry.type !== "directory") {
    throw new FileStoreError("ENOTDIR", "Search location is not a folder: " + scope);
  }
  const skip = (request.skipPaths ?? []).map(normalizeFileUri);
  const hidden = (uri: string) => skip.some(s => uri === s || uri.startsWith(s + "/"));
  const max = request.maxResults ?? Number.MAX_SAFE_INTEGER;
  if (!Number.isInteger(max) || max <= 0) throw new FileStoreError("EINVAL", "Invalid search result limit");
  const needle = request.text?.trim() ?? "";
  const ranked = request.sourceRanked || Boolean(needle);
  const compiled = ranked ? compileSourceSearch(needle) : null;
  const result: FileEntry[] = [];
  const ranking: { file: FileEntry; score: number; highlights: SourceSearchHighlight[] }[] = [];
  const queue = [scope];
  let foldersScanned = 0;
  let filesScanned = 0;
  let truncated = false;
  while (queue.length) {
    if (options.signal?.aborted) throw new DOMException("Search cancelled", "AbortError");
    const directory = queue.shift()!;
    if (hidden(directory)) continue;
    const list = await filesystem.list(directory);
    foldersScanned++;
    for (const item of list) {
      if (options.signal?.aborted) throw new DOMException("Search cancelled", "AbortError");
      if (hidden(item.uri)) continue;
      filesScanned++;
      const rankedMatch = compiled ? sourceSearchMatch(item, compiled, matchesSourceKind) : null;
      const matchesText = compiled ? rankedMatch !== null : !needle
        || item.name.toLocaleLowerCase().includes(needle.toLocaleLowerCase());
      const matchesPattern = (!request.namePattern || matchFilePattern(item.name, request.namePattern))
        && (!request.sourceNamePattern || matchSourceNamePattern(item.name, request.sourceNamePattern));
      const matchesDate = (request.modifiedAfter === undefined || item.mtime >= request.modifiedAfter)
        && (request.modifiedBefore === undefined || item.mtime <= request.modifiedBefore);
      const matchesSize = (request.minSizeBytes === undefined && request.maxSizeBytes === undefined)
        || (item.type === "file"
          && (request.minSizeBytes === undefined || item.size >= request.minSizeBytes)
          && (request.maxSizeBytes === undefined || item.size <= request.maxSizeBytes));
      const matchesKind = !request.kind || matchesSourceKind(item, request.kind);
      if (matchesText && matchesPattern && matchesDate && matchesSize && matchesKind) {
        result.push(item);
        if (compiled && rankedMatch) ranking.push({ file: item,
          score: rankedMatch.score, highlights: rankedMatch.highlights });
      }
      if (item.type === "directory" && request.subfolders) queue.push(item.uri);
      if (!ranked && result.length >= max) {
        truncated = queue.length > 0 || list.indexOf(item) !== list.length - 1;
        break;
      }
    }
    options.onProgress?.({ foldersScanned, filesScanned, matches: result.length });
    if (!ranked && result.length >= max) break;
  }
  if (ranked) {
    // The pinned source 2e2c.e ranks the full walk before presenting the list.
    // Do not stop at the first 500 alphabetical hits: later files may outrank them.
    ranking.sort((a, b) => b.score - a.score || b.file.mtime - a.file.mtime);
    const ordered = ranking.slice(0, max);
    return {
      files: ordered.map(hit => hit.file),
      progress: { foldersScanned, filesScanned, matches: result.length },
      truncated: result.length > max,
      highlights: Object.fromEntries(ordered.map(hit => [hit.file.uri, hit.highlights]))
    };
  }
  return { files: result, progress: { foldersScanned, filesScanned, matches: result.length }, truncated };
}
