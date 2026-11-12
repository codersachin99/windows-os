// Source contracts: legacy notepad.js, computer.js, cmd.js.
// This first slice supports text files and directories. Binary content,
// drive mounts and Recycle Bin are separate, not-yet-migrated capabilities.
export type FileEntryType = "file" | "directory";
export interface FileEntry {
  uri: string;
  name: string;
  type: FileEntryType;
  size: number;
  mtime: number;
}
export interface FileStoreStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
type StoredEntry = { uri: string; type: FileEntryType; mtime: number; content?: string };
type Snapshot = { version: 1; entries: StoredEntry[] };
export type FileStoreErrorCode = "EINVAL" | "ENOENT" | "EEXIST" | "ENOTDIR" | "EISDIR" | "ENOTEMPTY";
export class FileStoreError extends Error {
  constructor(public readonly code: FileStoreErrorCode, message: string) {
    super(message);
    this.name = "FileStoreError";
  }
}
export function normalizeFileUri(path: string): string {
  if (typeof path !== "string" || !path || path.includes("\0")) {
    throw new FileStoreError("EINVAL", "Invalid file path");
  }
  const slash = path.replace(/\\/g, "/");
  if (!slash.startsWith("/")) {
    throw new FileStoreError("EINVAL", "File paths must be absolute URIs");
  }
  const parts: string[] = [];
  for (const part of slash.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }
  return "/" + parts.join("/");
}
export function getParentDirectory(path: string): string {
  const uri = normalizeFileUri(path);
  return uri === "/" ? "/" : uri.slice(0, uri.lastIndexOf("/")) || "/";
}
export function getFileName(path: string): string {
  const uri = normalizeFileUri(path);
  return uri === "/" ? "/" : uri.slice(uri.lastIndexOf("/") + 1);
}
const root: StoredEntry = { uri: "/", type: "directory", mtime: 0 };
export type FileStoreChange =
  | { type: "created" | "updated" | "removed"; path: string }
  | { type: "copied" | "moved"; from: string; to: string };

export class VirtualFileStore {
  private readonly listeners = new Set<(change: FileStoreChange) => void>();

  /** Notify all open applications after a successfully persisted change. */
  subscribe(listener: (change: FileStoreChange) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  private notify(change: FileStoreChange): void {
    for (const listener of this.listeners) {
      try { listener(change); } catch {
        // A crashed UI subscriber must not make a committed filesystem write fail.
      }
    }
  }

  private entries = new Map<string, StoredEntry>([["/", root]]);
  constructor(
    private readonly storage?: FileStoreStorage,
    private readonly storageKey = "windows-os:vfs:guest:v1"
  ) {
    const raw = storage?.getItem(storageKey);
    if (!raw) return;
    try {
      const state = JSON.parse(raw) as Snapshot;
      if (state.version !== 1 || !Array.isArray(state.entries)) throw new Error("Bad version");
      const restored = new Map<string, StoredEntry>([["/", root]]);
      for (const item of state.entries) {
        if (!item || typeof item.uri !== "string" || item.uri === "/"
          || normalizeFileUri(item.uri) !== item.uri
          || (item.type !== "file" && item.type !== "directory")
          || !Number.isFinite(item.mtime)
          || (item.type === "file" && typeof item.content !== "string")
          || restored.has(item.uri)) throw new Error("Invalid node");
        restored.set(item.uri, { ...item });
      }
      for (const uri of restored.keys()) {
        if (uri !== "/" && restored.get(getParentDirectory(uri))?.type !== "directory") {
          throw new Error("Missing parent");
        }
      }
      this.entries = restored;
    } catch {
      // Never overwrite a corrupt or newer persisted store with an empty one.
      throw new FileStoreError("EINVAL", "Stored file data cannot be loaded");
    }
  }
  private entry(item: StoredEntry): FileEntry {
    return {
      uri: item.uri, name: getFileName(item.uri), type: item.type,
      size: item.type === "file" ? new TextEncoder().encode(item.content ?? "").byteLength : 0,
      mtime: item.mtime
    };
  }
  private required(path: string): StoredEntry {
    const uri = normalizeFileUri(path);
    const item = this.entries.get(uri);
    if (!item) throw new FileStoreError("ENOENT", "Path does not exist: " + uri);
    return item;
  }
  private directory(path: string): StoredEntry {
    const item = this.required(path);
    if (item.type !== "directory") throw new FileStoreError("ENOTDIR", "Not a directory: " + item.uri);
    return item;
  }
  private destination(uri: string): void {
    if (uri === "/") throw new FileStoreError("EINVAL", "Cannot replace root");
    this.directory(getParentDirectory(uri));
    if (this.entries.has(uri)) throw new FileStoreError("EEXIST", "Path exists: " + uri);
  }
  private commit(next: Map<string, StoredEntry>, change: FileStoreChange): void {
    if (this.storage) {
      const state: Snapshot = {
        version: 1,
        entries: [...next.values()].filter(item => item.uri !== "/")
          .sort((a, b) => a.uri.localeCompare(b.uri))
      };
      this.storage.setItem(this.storageKey, JSON.stringify(state));
    }
    this.entries = next;
    this.notify(change);
  }
  async stat(path: string): Promise<FileEntry | null> {
    const item = this.entries.get(normalizeFileUri(path));
    return item ? this.entry(item) : null;
  }
  async isExisting(path: string): Promise<boolean> {
    return this.entries.has(normalizeFileUri(path));
  }
  async list(path: string): Promise<FileEntry[]> {
    const dir = this.directory(path).uri;
    return [...this.entries.values()]
      .filter(item => item.uri !== dir && getParentDirectory(item.uri) === dir)
      .map(item => this.entry(item))
      .sort((a, b) => a.type === b.type
        ? a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
        : a.type === "directory" ? -1 : 1);
  }
  async read(path: string, _asText = true): Promise<string> {
    const item = this.required(path);
    if (item.type !== "file") throw new FileStoreError("EISDIR", "Not a file: " + item.uri);
    return item.content ?? "";
  }
  async write(content: string, path: string): Promise<FileEntry> {
    if (typeof content !== "string") throw new FileStoreError("EINVAL", "Text content required");
    const uri = normalizeFileUri(path);
    if (uri === "/") throw new FileStoreError("EISDIR", "Cannot write root");
    this.directory(getParentDirectory(uri));
    if (this.entries.get(uri)?.type === "directory") {
      throw new FileStoreError("EISDIR", "Cannot write to a directory");
    }
    const existed = this.entries.has(uri);
    const item: StoredEntry = { uri, type: "file", content, mtime: Date.now() };
    const next = new Map(this.entries);
    next.set(uri, item);
    this.commit(next, { type: existed ? "updated" : "created", path: uri });
    return this.entry(item);
  }
  async mkdir(path: string): Promise<FileEntry> {
    const uri = normalizeFileUri(path);
    this.destination(uri);
    const item: StoredEntry = { uri, type: "directory", mtime: Date.now() };
    const next = new Map(this.entries);
    next.set(uri, item);
    this.commit(next, { type: "created", path: uri });
    return this.entry(item);
  }
  async remove(path: string): Promise<void> {
    const uri = normalizeFileUri(path);
    if (uri === "/") throw new FileStoreError("EINVAL", "Cannot delete root");
    this.required(uri);
    if ([...this.entries.keys()].some(key => key.startsWith(uri + "/"))) {
      throw new FileStoreError("ENOTEMPTY", "Directory is not empty: " + uri);
    }
    const next = new Map(this.entries);
    next.delete(uri);
    this.commit(next, { type: "removed", path: uri });
  }
  private transfer(source: string, destination: string, move: boolean): void {
    const from = normalizeFileUri(source);
    const to = normalizeFileUri(destination);
    if (from === "/" || to === "/" || from === to || to.startsWith(from + "/")) {
      throw new FileStoreError("EINVAL", "Invalid copy or move destination");
    }
    this.required(from);
    this.destination(to);
    const affected = [...this.entries.values()].filter(item =>
      item.uri === from || item.uri.startsWith(from + "/"));
    const next = new Map(this.entries);
    if (move) for (const item of affected) next.delete(item.uri);
    for (const item of affected) {
      const path = to + item.uri.slice(from.length);
      if (next.has(path)) throw new FileStoreError("EEXIST", "Path exists: " + path);
      next.set(path, { ...item, uri: path, mtime: Date.now() });
    }
    this.commit(next, { type: move ? "moved" : "copied", from, to });
  }
  async move(from: string, to: string): Promise<void> { this.transfer(from, to, true); }
  async copy(from: string, to: string): Promise<void> { this.transfer(from, to, false); }
  getParentDirectory(path: string): string { return getParentDirectory(path); }
}

export * from "./drivePaths";

export * from "./volumeSession";

export { FileClipboard } from "./clipboard";
export type { ClipboardOperation, FileClipboardState } from "./clipboard";

export { searchFiles, matchFilePattern } from "./search";
export type { FileSearchRequest, FileSearchResult, FileSearchProgress } from "./search";
