import {
  FileStoreError, getParentDirectory, normalizeFileUri,
  type FileEntry, type VirtualFileStore
} from "@windows-os/filesystem";

/**
 * Source-following Explorer navigation/session state from computer.js:
 * open, history, back/forward, selection, view mode and shared file updates.
 * Full disk, search index and Recycle Bin protocols remain pending.
 */
export type ExplorerViewMode = "details" | "list" | "small-icons" | "medium-icons" | "large-icons" | "tiles" | "content";
export interface ExplorerState {
  path: string;
  items: FileEntry[];
  selected: string[];
  search: string;
  viewMode: ExplorerViewMode;
  busy: boolean;
  error: string | null;
  canGoBack: boolean;
  canGoForward: boolean;
}

export class ExplorerSession {
  private paths: string[];
  private position = 0;
  private state: ExplorerState;
  private readonly listeners = new Set<(state: ExplorerState) => void>();
  private readonly stop: () => void;
  private closed = false;
  private revision = 0;

  constructor(private readonly filesystem: VirtualFileStore, path = "/") {
    const initial = normalizeFileUri(path);
    this.paths = [initial];
    this.state = {
      path: initial, items: [], selected: [], search: "", viewMode: "details",
      busy: false, error: null, canGoBack: false, canGoForward: false
    };
    this.stop = filesystem.subscribe(() => { void this.refresh(); });
  }

  snapshot(): ExplorerState {
    return { ...this.state, items: [...this.state.items], selected: [...this.state.selected] };
  }
  subscribe(listener: (state: ExplorerState) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  close(): void {
    this.closed = true;
    this.revision++;
    this.stop();
    this.listeners.clear();
  }
  private emit(): void {
    if (this.closed) return;
    const snapshot = this.snapshot();
    for (const listener of this.listeners) listener(snapshot);
  }
  private set(patch: Partial<ExplorerState>): void {
    this.state = { ...this.state, ...patch };
    this.emit();
  }
  private history(): Pick<ExplorerState, "canGoBack" | "canGoForward"> {
    return {
      canGoBack: this.position > 0,
      canGoForward: this.position < this.paths.length - 1
    };
  }
  visible(): FileEntry[] {
    const search = this.state.search.trim().toLocaleLowerCase();
    return this.state.items.filter(item => item.name.toLocaleLowerCase().includes(search));
  }
  select(uri: string, toggle = false): void {
    if (toggle) {
      const selected = this.state.selected.includes(uri)
        ? this.state.selected.filter(x => x !== uri) : [...this.state.selected, uri];
      this.set({ selected });
    } else this.set({ selected: [uri] });
  }
  search(query: string): void { this.set({ search: query }); }
  setViewMode(viewMode: ExplorerViewMode): void { this.set({ viewMode }); }

  async refresh(): Promise<void> {
    const version = ++this.revision;
    const path = this.state.path;
    this.set({ busy: true, error: null });
    try {
      const items = await this.filesystem.list(path);
      if (this.closed || version !== this.revision) return;
      this.set({
        items, busy: false, error: null,
        selected: this.state.selected.filter(x => items.some(item => item.uri === x)),
        ...this.history()
      });
    } catch (cause) {
      if (this.closed || version !== this.revision) return;
      this.set({ items: [], busy: false, error: cause instanceof Error ? cause.message : "Cannot read folder" });
    }
  }

  async open(path: string, addHistory = true): Promise<void> {
    const uri = normalizeFileUri(path);
    const item = await this.filesystem.stat(uri);
    if (!item) throw new FileStoreError("ENOENT", "Folder not found: " + uri);
    if (item.type !== "directory") throw new FileStoreError("ENOTDIR", "Not a folder: " + uri);
    if (addHistory && uri !== this.state.path) {
      this.paths = [...this.paths.slice(0, this.position + 1), uri];
      this.position = this.paths.length - 1;
    }
    this.set({ path: uri, selected: [], search: "", ...this.history() });
    await this.refresh();
  }
  async back(): Promise<void> {
    if (this.position === 0) return;
    this.position--;
    await this.open(this.paths[this.position], false);
  }
  async forward(): Promise<void> {
    if (this.position === this.paths.length - 1) return;
    this.position++;
    await this.open(this.paths[this.position], false);
  }
  async up(): Promise<void> {
    await this.open(getParentDirectory(this.state.path));
  }
  async createFolder(name: string): Promise<void> {
    if (!name.trim() || name === "." || name === ".." || /[/\\\0]/.test(name)) {
      throw new FileStoreError("EINVAL", "Invalid folder name");
    }
    await this.filesystem.mkdir((this.state.path === "/" ? "" : this.state.path) + "/" + name.trim());
  }
  async rename(uri: string, name: string): Promise<void> {
    if (!name.trim() || name === "." || name === ".." || /[/\\\0]/.test(name)) {
      throw new FileStoreError("EINVAL", "Invalid name");
    }
    const path = getParentDirectory(uri);
    await this.filesystem.move(uri, (path === "/" ? "" : path) + "/" + name.trim());
  }
}
