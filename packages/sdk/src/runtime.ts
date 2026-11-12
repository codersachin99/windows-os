import {
  LegacyVolumeSession, type LegacyRuntimeMounts, type VirtualFileStore
} from "@windows-os/filesystem";
import { fileStore } from "./files";

/**
 * Source Vuex dynamically assigns systemPath / desktopPath / trashPath after
 * filesystem bootstrap. React uses the same source-provided mount metadata;
 * never invent source drives or a default C: / Recycle Bin directory.
 */
export class SourceFilesystemRuntime {
  private session: LegacyVolumeSession | null = null;
  private readonly listeners = new Set<(session: LegacyVolumeSession | null) => void>();

  constructor(private readonly store: VirtualFileStore) {}
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
    this.session = candidate;
    this.publish();
  }
  clear(): void {
    this.session = null;
    this.publish();
  }
}
export const sourceFilesystemRuntime = new SourceFilesystemRuntime(fileStore);
