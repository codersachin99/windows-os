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
  originalPath?: string;
  deletedAt?: number;
}
export interface FileStoreStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
type StoredEntry = {
  uri: string;
  type: FileEntryType;
  mtime: number;
  /** UTF-8 text or base64 bytes; never both. */
  content?: string;
  bytes?: string;
  originalPath?: string;
  deletedAt?: number;
};
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

function encodeBytes(bytes: Uint8Array): string {
  let binary = "";
  for (let offset = 0; offset < bytes.length; offset += 0x4000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x4000));
  }
  return btoa(binary);
}
function decodeBytes(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0));
}
function validBase64(value: unknown): value is string {
  return typeof value === "string" && value.length % 4 === 0
    && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(value);
}
export type FileStoreChange =
  | { type: "created" | "updated" | "removed" | "emptied"; path: string }
  | { type: "copied" | "moved" | "trashed" | "restored"; from: string; to: string };

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
          || (item.type === "file" && !(
            (typeof item.content === "string" && item.bytes === undefined)
            || (item.content === undefined && validBase64(item.bytes))
          ))
          || (item.type === "directory" && (item.content !== undefined || item.bytes !== undefined))
          || (item.originalPath !== undefined && (
            typeof item.originalPath !== "string"
            || normalizeFileUri(item.originalPath) !== item.originalPath
            || typeof item.deletedAt !== "number" || !Number.isFinite(item.deletedAt)
          ))
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
      size: item.type !== "file" ? 0 : item.bytes !== undefined
        ? (item.bytes.length / 4) * 3 - (item.bytes.endsWith("==") ? 2
          : item.bytes.endsWith("=") ? 1 : 0)
        : new TextEncoder().encode(item.content ?? "").byteLength,
      mtime: item.mtime,
      ...(item.originalPath === undefined ? {} : {
        originalPath: item.originalPath, deletedAt: item.deletedAt
      })
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
    if (item.bytes !== undefined) {
      throw new FileStoreError("EINVAL", "Binary file cannot be read as text: " + item.uri);
    }
    return item.content ?? "";
  }
  /** Preserve exact binary data, including source's installed 1024-byte MZ stubs. */
  async readBytes(path: string): Promise<Uint8Array> {
    const item = this.required(path);
    if (item.type !== "file") throw new FileStoreError("EISDIR", "Not a file: " + item.uri);
    return item.bytes !== undefined
      ? decodeBytes(item.bytes) : new TextEncoder().encode(item.content ?? "");
  }
  async writeBytes(bytes: Uint8Array, path: string): Promise<FileEntry> {
    if (!(bytes instanceof Uint8Array)) {
      throw new FileStoreError("EINVAL", "Binary Uint8Array content is required");
    }
    const uri = normalizeFileUri(path);
    if (uri === "/") throw new FileStoreError("EISDIR", "Cannot write root");
    this.directory(getParentDirectory(uri));
    if (this.entries.get(uri)?.type === "directory") {
      throw new FileStoreError("EISDIR", "Cannot write to a directory");
    }
    const item: StoredEntry = {
      uri, type: "file", bytes: encodeBytes(bytes), mtime: Date.now()
    };
    const existed = this.entries.has(uri);
    const next = new Map(this.entries);
    next.set(uri, item);
    this.commit(next, { type: existed ? "updated" : "created", path: uri });
    return this.entry(item);
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

  /**
   * Import a complete browser File selection with one persisted Guest snapshot.
   * Browser File decoding occurs before this call; validation of every target
   * is repeated here to close races with another open Explorer/Desktop window.
   * Unlike write()/writeBytes(), this operation is create-only and can never
   * overwrite an existing user entry. Storage/quota failure leaves the
   * in-memory tree untouched and publishes no partial file events.
   */
  async createFilesAtomic(
    files: readonly { path: string; content: string | Uint8Array }[]
  ): Promise<FileEntry[]> {
    if (!files.length) return [];
    const staged: StoredEntry[] = [];
    const seen = new Set<string>();
    const timestamp = Date.now();
    for (const file of files) {
      const uri = normalizeFileUri(file.path);
      if (uri === "/") throw new FileStoreError("EINVAL", "Cannot create filesystem root");
      const key = uri.toLocaleLowerCase();
      if (seen.has(key)) throw new FileStoreError("EEXIST", "Duplicate import target: " + uri);
      seen.add(key);
      this.destination(uri);
      if (typeof file.content !== "string" && !(file.content instanceof Uint8Array))
        throw new FileStoreError("EINVAL", "Imported file needs text or binary content");
      staged.push({
        uri, type: "file", mtime: timestamp,
        ...(typeof file.content === "string"
          ? { content: file.content } : { bytes: encodeBytes(file.content) })
      });
    }
    const next = new Map(this.entries);
    for (const item of staged) next.set(item.uri, item);
    this.commit(next, { type: "created", path: staged[0].uri });
    for (const item of staged.slice(1)) this.notify({ type: "created", path: item.uri });
    return staged.map(item => this.entry(item));
  }

  /**
   * Source FileCreate semantics: create an empty/new text-backed file without
   * replacing a name that already exists. Unlike write(), a race with another
   * creator is an EEXIST error, never a silent overwrite.
   */
  async createFile(content: string, path: string): Promise<FileEntry> {
    if (typeof content !== "string") {
      throw new FileStoreError("EINVAL", "Text content required");
    }
    const uri = normalizeFileUri(path);
    this.destination(uri);
    const item: StoredEntry = { uri, type: "file", content, mtime: Date.now() };
    const next = new Map(this.entries);
    next.set(uri, item);
    this.commit(next, { type: "created", path: uri });
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
  /**
   * Source FileRemove/Recycle Bin permanent removal must also handle folders
   * containing files. Commit the entire subtree as one persistent VFS change.
   */
  async removeTree(path: string): Promise<void> {
    const uri = normalizeFileUri(path);
    if (uri === "/") throw new FileStoreError("EINVAL", "Cannot delete root");
    this.required(uri);
    const next = new Map(this.entries);
    for (const key of next.keys()) {
      if (key === uri || key.startsWith(uri + "/")) next.delete(key);
    }
    this.commit(next, { type: "removed", path: uri });
  }
  /**
   * Source Recycle Bin uses a session-specific trashPath supplied by the
   * shell (bin.js wraps Computer at that path). No default trash mount is
   * created here. Trash metadata lives in the SAME persistent VFS snapshot
   * as the moved item so a failed storage commit cannot orphan its metadata.
   */
  /**
   * Atomically recycle a desktop multi-selection. The original desktop can
   * move multiple FileMove/TrashAdd paths in one drag; one persisted snapshot
   * prevents storage failure from sending only part of a group to Recycle Bin.
   * Keep the single-item API as a wrapper for existing Explorer/Delete users.
   */
  async trashMany(paths: readonly string[], trashPath: string): Promise<FileEntry[]> {
    const bin = this.directory(trashPath).uri;
    if (!paths.length) return [];
    const originals = paths.map(normalizeFileUri);
    if (new Set(originals).size !== originals.length) {
      throw new FileStoreError("EINVAL", "Duplicate file selection");
    }
    for (const from of originals) {
      if (from === "/" || from === bin || from.startsWith(bin + "/")
        || bin.startsWith(from + "/")) {
        throw new FileStoreError("EINVAL", "Cannot recycle a system root or trash item");
      }
      this.required(from);
      if (originals.some(other => other !== from && from.startsWith(other + "/"))) {
        throw new FileStoreError("EINVAL", "Nested folders cannot both be recycled");
      }
    }
    const next = new Map(this.entries);
    const changes: { from: string; to: string }[] = [];
    const result: FileEntry[] = [];
    const deletedAt = Date.now();
    for (const from of originals) {
      const name = getFileName(from);
      const extAt = name.lastIndexOf(".");
      const base = extAt > 0 ? name.slice(0, extAt) : name;
      const extension = extAt > 0 ? name.slice(extAt) : "";
      let to = normalizeFileUri(bin + "/" + name);
      let attempt = 0;
      while (next.has(to)) {
        attempt++;
        to = normalizeFileUri(bin + "/" + base + " (" + attempt + ")" + extension);
      }
      const affected = [...this.entries.values()].filter(item =>
        item.uri === from || item.uri.startsWith(from + "/"));
      for (const item of affected) next.delete(item.uri);
      for (const item of affected) {
        const target = to + item.uri.slice(from.length);
        next.set(target, {
          ...item, uri: target,
          ...(item.uri === from ? { originalPath: from, deletedAt } : {})
        });
      }
      changes.push({ from, to });
      result.push(this.entry(next.get(to)!));
    }
    this.commit(next, { type: "trashed", ...changes[0] });
    // Compatibility: subscribers that inspect individual paths still receive
    // every moved file, but only after the entire batch has persisted.
    for (const change of changes.slice(1)) {
      this.notify({ type: "trashed", ...change });
    }
    return result;
  }

  async trash(path: string, trashPath: string): Promise<FileEntry> {
    return (await this.trashMany([path], trashPath))[0];
  }

  async restore(trashItem: string, trashPath: string): Promise<FileEntry> {
    const from = normalizeFileUri(trashItem);
    const bin = this.directory(trashPath).uri;
    if (getParentDirectory(from) !== bin) {
      throw new FileStoreError("EINVAL", "Item is not in the session Recycle Bin");
    }
    const item = this.required(from);
    const destination = item.originalPath;
    if (!destination) throw new FileStoreError("EINVAL", "Recycle metadata is missing");
    this.destination(destination);
    const affected = [...this.entries.values()].filter(child =>
      child.uri === from || child.uri.startsWith(from + "/"));
    const next = new Map(this.entries);
    for (const child of affected) next.delete(child.uri);
    for (const child of affected) {
      const target = destination + child.uri.slice(from.length);
      if (next.has(target)) throw new FileStoreError("EEXIST", "Restore destination exists");
      const copied = { ...child, uri: target };
      if (child.uri === from) {
        delete copied.originalPath;
        delete copied.deletedAt;
      }
      next.set(target, copied);
    }
    this.commit(next, { type: "restored", from, to: destination });
    return this.entry(next.get(destination)!);
  }

  /** Permanently remove all bin contents; retain its configured directory. */
  async emptyTrash(trashPath: string): Promise<void> {
    const bin = this.directory(trashPath).uri;
    const next = new Map(this.entries);
    for (const path of next.keys()) {
      if (path.startsWith(bin + "/")) next.delete(path);
    }
    this.commit(next, { type: "emptied", path: bin });
  }
  /**
   * Atomic multi-file FileCopy/FileMove for mounted Guest volumes. Validate
   * every root and descendant and stage all changes before ONE storage write.
   * If storage.setItem throws (quota, I/O), this.entries and subscribers never
   * observe a partial transfer; no rollback writes are attempted.
   *
   * Source order controls the returned roots; nested selections are deduped.
   */
  async transferMany(
    paths: readonly string[], destination: string, mode: "copy" | "move"
  ): Promise<FileEntry[]> {
    if (mode !== "copy" && mode !== "move")
      throw new FileStoreError("EINVAL", "Invalid transfer mode");
    if (!paths.length) throw new FileStoreError("EINVAL", "No files selected");
    const folder = this.directory(destination).uri;
    const unique = [...new Set(paths.map(normalizeFileUri))];
    if (unique.includes("/")) throw new FileStoreError("EINVAL", "Cannot transfer filesystem root");
    const sources = unique.filter(from => !unique.some(parent =>
      from !== parent && from.startsWith(parent + "/")));
    const plan = sources.map(from => ({
      from, to: normalizeFileUri((folder === "/" ? "" : folder) + "/" + getFileName(from))
    }));
    if (new Set(plan.map(({to}) => to)).size !== plan.length) {
      throw new FileStoreError("EEXIST", "Selected files share a destination name");
    }
    for (const {from,to} of plan) {
      this.required(from);
      if (from === to || to.startsWith(from + "/"))
        throw new FileStoreError("EINVAL", "Cannot paste into the same file or a nested folder");
      if (this.entries.has(to))
        throw new FileStoreError("EEXIST", "Destination already exists: " + to);
    }
    const next = new Map(this.entries);
    const changes: {from:string;to:string}[] = [];
    const timestamp = Date.now();
    for (const {from,to} of plan) {
      const children = [...this.entries.values()].filter(item =>
        item.uri === from || item.uri.startsWith(from + "/"));
      if (mode === "move") for (const child of children) next.delete(child.uri);
      for (const child of children) {
        const uri = to + child.uri.slice(from.length);
        if (next.has(uri)) throw new FileStoreError("EEXIST", "Path exists: " + uri);
        next.set(uri, { ...child, uri, mtime: timestamp });
      }
      changes.push({from,to});
    }
    const type = mode === "move" ? "moved" : "copied";
    this.commit(next, { type, ...changes[0] });
    // Notify each source only AFTER the atomic snapshot has persisted.
    for (const change of changes.slice(1)) this.notify({ type, ...change });
    return changes.map(({to}) => this.entry(next.get(to)!));
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

export { searchFiles, matchFilePattern, matchSourceNamePattern, matchesSourceKind } from "./search";
export { SourceSearchIndex } from "./sourceSearchIndex";
export {
  normalizeSourceSearchText, parseSourceSearchText, findSourceWordStart,
  scoreSourceFileName, sourceSearchHighlights, sourceSizeRange,
  sourceModifiedRange, compileSourceSearch, sourceSearchMatch
} from "./sourceTextSearch";
export type { SourceParsedSearch, SourceSearchMatch, SourceSearchHighlight } from "./sourceTextSearch";
export { sourceSearchLocations, sourceMountedSearchRoots, sourceComputerSearchLocation } from "./sourceSearchLocations";
export { encodeSourceSearchPath, decodeSourceSearchPath, isSourceSearchPath,
  SOURCE_SEARCH_URI_PREFIX } from "./sourceSearchPath";
export type { SourceSearchPath } from "./sourceSearchPath";
export { createSourceFindQuery, encodeSourceFindPath, decodeSourceFindPath, sourceFindSearchRequest,
  SOURCE_FIND_PREFIX } from "./findQuery";
export type { SourceFindQuery } from "./findQuery";
export type { FileSearchRequest, FileSearchResult, FileSearchProgress } from "./search";

export * from "./sourceGuest";

export * from "./sourcePrograms";

export { transferFiles } from "./transfer";
export type { FileTransferMode } from "./transfer";

export { FileDragSession, SHELL_DRAG_TYPE, importDroppedFiles } from "./drag";

// Original shared webpack 4cca byte-format contract (Computer + other apps).
export { sourceSizeFromBytes } from "./sourceSize";
