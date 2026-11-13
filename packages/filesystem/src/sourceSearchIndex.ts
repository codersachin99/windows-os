import {
  getParentDirectory, normalizeFileUri,
  type FileEntry, type FileStoreChange, type VirtualFileStore
} from "./index";

/**
 * Per-Computer source searchIndex (webpack 2e2c.b).
 * 
 * The original caches each directory listing for subsequent queries, filters
 * the hidden ".meta" record, and invalidates indexed paths when Explorer's
 * file store reports a change. This adapter operates only on VirtualFileStore:
 * never use a host filesystem path or disk API as a search root.
 */
export class SourceSearchIndex {
  private readonly listings = new Map<string, Promise<FileEntry[]>>();
  private readonly listeners = new Set<() => void>();
  private unsubscribe: (() => void) | null = null;
  private disposed = false;

  // The constructor must be pure: React StrictMode double-invokes memo
  // constructors in development, and an eager subscribe would leak the
  // discarded instance. connect() is intentionally repeatable on remount.
  constructor(private readonly filesystem: Pick<VirtualFileStore, "stat" | "list" | "subscribe">) {}

  /** Attach the Guest VFS event bridge once per mounted Explorer lifetime. */
  connect(): () => void {
    if (!this.unsubscribe) {
      this.disposed = false;
      this.unsubscribe = this.filesystem.subscribe(change => this.changed(change));
    }
    return () => this.dispose();
  }

  stat(path: string): Promise<FileEntry | null> {
    return this.filesystem.stat(path);
  }

  /** Cache in-flight lookups as well as fulfilled ones, like source 2e2c.b. */
  async list(path: string): Promise<FileEntry[]> {
    const uri = normalizeFileUri(path);
    let listing = this.listings.get(uri);
    if (!listing) {
      listing = this.filesystem.list(uri)
        // Source 2e2c.b silently returns [] on unreadable directories.
        .then(items => items.filter(item => item.name !== ".meta"))
        .catch(() => []);
      this.listings.set(uri, listing);
    }
    // Consumers must never be able to mutate a cached listing array.
    return [...await listing];
  }

  /** Pinned 2e2c.b invalidate: remove matching keys and every descendant. */
  invalidate(paths: readonly string[]): boolean {
    const affected = paths.map(normalizeFileUri);
    let invalidated = false;
    for (const key of this.listings.keys()) {
      if (affected.some(path => key === path || key.startsWith(path + "/"))) {
        this.listings.delete(key);
        invalidated = true;
      }
    }
    if (invalidated && !this.disposed) {
      for (const listener of this.listeners) listener();
    }
    return invalidated;
  }

  /**
   * Source changed(e) receives affected directory paths. Guest VFS events
   * refer to changed *file* paths, so invalidate each enclosing listing too,
   * including old and new parents for a move/restore/rename. Directory trees
   * are removed by invalidate's descendant rule.
   */
  private changed(change: FileStoreChange): void {
    const paths = "path" in change ? [change.path] : [change.from, change.to];
    const touched = paths.flatMap(path => [path, getParentDirectory(path)]);
    this.invalidate(touched);
  }

  subscribeInvalidation(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }

  clear(): void {
    this.listings.clear();
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.listeners.clear();
    this.clear();
  }
}
