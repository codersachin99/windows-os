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
      const matchesPattern = !request.namePattern || matchFilePattern(item.name, request.namePattern);
      if (matchesText && matchesPattern) result.push(item);
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
