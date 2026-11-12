import {
  FileStoreError, normalizeFileUri,
  type FileEntry, type VirtualFileStore
} from "./index";

/**
 * The original Computer search tracks scope, namePattern and subfolders
 * (legacy src/modules/apps/computer.js -> listSearch/searchIndex.walk).
 * This first port scans real virtual paths; content indexing, result ranking
 * and legacy query operators are separate, not-yet-verified features.
 */
export interface FileSearchRequest {
  scope: string;
  text?: string;
  namePattern?: string | null;
  /** Original Find and Search Companion support comma/semicolon-separated patterns. */
  sourceNamePattern?: string;
  modifiedAfter?: number;
  modifiedBefore?: number;
  minSizeBytes?: number;
  maxSizeBytes?: number;
  kind?: "folder" | "text" | "image" | "audio" | "video" | "document" | "archive" | "application";
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
  const terms = sourcePattern.split(/[;,]/).map(p => p.trim().toLocaleLowerCase()).filter(Boolean);
  if (!terms.length) return true;
  const lower = name.toLocaleLowerCase();
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
    application: ["bat", "cmd", "com", "exe", "msi"]
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
  const needle = request.text?.trim().toLocaleLowerCase() ?? "";
  const result: FileEntry[] = [];
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
      const matchesText = !needle || item.name.toLocaleLowerCase().includes(needle);
      const matchesPattern = (!request.namePattern || matchFilePattern(item.name, request.namePattern))
        && (!request.sourceNamePattern || matchSourceNamePattern(item.name, request.sourceNamePattern));
      const matchesDate = (request.modifiedAfter === undefined || item.mtime >= request.modifiedAfter)
        && (request.modifiedBefore === undefined || item.mtime <= request.modifiedBefore);
      const matchesSize = (request.minSizeBytes === undefined || item.size >= request.minSizeBytes)
        && (request.maxSizeBytes === undefined || item.size <= request.maxSizeBytes);
      const matchesKind = !request.kind || matchesSourceKind(item, request.kind);
      if (matchesText && matchesPattern && matchesDate && matchesSize && matchesKind) result.push(item);
      if (item.type === "directory" && request.subfolders) queue.push(item.uri);
      if (result.length >= max) {
        truncated = queue.length > 0 || list.indexOf(item) !== list.length - 1;
        break;
      }
    }
    options.onProgress?.({ foldersScanned, filesScanned, matches: result.length });
    if (result.length >= max) break;
  }
  return { files: result, progress: { foldersScanned, filesScanned, matches: result.length }, truncated };
}
