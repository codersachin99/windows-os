import {
  LegacyVolumeSession, type LegacyRuntimeMounts, type VirtualFileStore,
  type FileStoreStorage, sourceGuestMounts,
  ensureSourceGuestDirectories
} from "@windows-os/filesystem";
import { browserStorage, fileStore } from "./files";

/**
 * Source Vuex dynamically assigns systemPath / desktopPath / trashPath after
 * filesystem bootstrap. React uses the same source-provided mount metadata;
 * never invent source drives or a default C: / Recycle Bin directory.
 */
export class SourceFilesystemRuntime {
  private session: LegacyVolumeSession | null = null;
  private readonly listeners = new Set<(session: LegacyVolumeSession | null) => void>();

  constructor(
    private readonly store: VirtualFileStore,
    private readonly storage?: FileStoreStorage,
    private readonly key = "windows-os:legacy-source-mounts:guest:v1"
  ) {}
  snapshot(): LegacyVolumeSession | null { return this.session; }
  subscribe(listener: (session: LegacyVolumeSession | null) => void): () => void {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  private publish(): void {
    for (const listener of this.listeners) {
      try { listener(this.session); } catch { /* UI subscriber failures are isolated */ }
    }
  }
  async configure(sourceRuntime: LegacyRuntimeMounts): Promise<void> {
    const candidate = new LegacyVolumeSession(this.store, sourceRuntime);
    await candidate.mount();
    // Only source-provided mount metadata is retained. No fallback disk layout.
    this.storage?.setItem(this.key, JSON.stringify({ version: 1, runtime: sourceRuntime }));
    this.session = candidate;
    this.publish();
  }
  /**
   * Original source: drive0 System C: is created on first boot (g.init),
   * then the Guest user folder is populated (g.ensureUser(null)).
   * If a prior *explicit* source runtime is supplied, restore it instead.
   */
  async startGuest(): Promise<void> {
    if (this.session) return;
    if (this.storage?.getItem(this.key)) {
      await this.restorePersisted();
      return;
    }
    const source = sourceGuestMounts();
    const candidate = new LegacyVolumeSession(this.store, source);
    await ensureSourceGuestDirectories(this.store);
    // One document holds the source-defined C: and special-folder paths.
    this.storage?.setItem(this.key, JSON.stringify({ version: 1, runtime: source }));
    this.session = candidate;
    this.publish();
  }
  async restorePersisted(): Promise<void> {
    const raw = this.storage?.getItem(this.key);
    if (!raw) return;
    let data: { version: 1; runtime: LegacyRuntimeMounts };
    try {
      data = JSON.parse(raw) as { version: 1; runtime: LegacyRuntimeMounts };
      if (!data || data.version !== 1 || !data.runtime) throw new Error("Invalid version");
    } catch {
      throw new Error("Stored legacy mount configuration is invalid");
    }
    const candidate = new LegacyVolumeSession(this.store, data.runtime);
    await candidate.mount();
    this.session = candidate;
    this.publish();
  }
  clear(): void {
    this.session = null;
    this.publish();
  }
}
export const sourceFilesystemRuntime = new SourceFilesystemRuntime(fileStore, browserStorage());
