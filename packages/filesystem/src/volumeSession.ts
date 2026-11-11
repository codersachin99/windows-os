import {
  FileStoreError, VirtualFileStore, normalizeFileUri, getParentDirectory,
  drivesFromLegacyStats, toStorageUri, fromStorageUri,
  type LegacyDriveStats, type LegacyPathConfig, type FileStoreStorage
} from "./index";

/**
 * Source shell stores systemPath, desktopPath and trashPath at runtime.
 * Build directories only from those paths and actual disk getStats metadata,
 * never an invented C: drive, Desktop folder or mounted host filesystem.
 */
export interface LegacyRuntimeMounts {
  root: string;
  desktopPath: string;
  trashPath: string;
  disks: readonly LegacyDriveStats[];
  user?: { folder: string; name: string };
}

export function createProfileFileStore(
  storage: FileStoreStorage | undefined, identity: { kind: "guest" } |
  { kind: "user"; id: string }
): VirtualFileStore {
  if (identity.kind === "guest") {
    // Preserve compatibility with the first Guest store's existing localStorage key.
    return new VirtualFileStore(storage);
  }
  if (!identity.id.trim()) throw new FileStoreError("EINVAL", "User ID is required");
  return new VirtualFileStore(storage,
    "windows-os:vfs:user:" + encodeURIComponent(identity.id) + ":v1");
}

export class LegacyVolumeSession {
  readonly pathConfig: LegacyPathConfig;
  readonly desktopPath: string;
  readonly trashPath: string;

  constructor(readonly store: VirtualFileStore, runtime: LegacyRuntimeMounts) {
    const root = normalizeFileUri(runtime.root);
    this.desktopPath = normalizeFileUri(runtime.desktopPath);
    this.trashPath = normalizeFileUri(runtime.trashPath);
    const drives = drivesFromLegacyStats(runtime.disks);
    if (drives.some(d => !/^[A-Z]$/.test(d.letter) || !d.path
      || d.path === "." || d.path === ".." || d.path.includes("\\")
      || d.path.includes("/"))) {
      throw new FileStoreError("EINVAL", "Invalid source disk mount");
    }
    if (new Set(drives.map(d => d.letter)).size !== drives.length
      || new Set(drives.map(d => d.path)).size !== drives.length) {
      throw new FileStoreError("EINVAL", "Duplicate source disk mount");
    }
    if (!drives.some(d => runtime.disks.some(raw =>
      normalizeFileUri(raw.path ?? "/") === normalizeFileUri(root + "/" + d.path)))) {
      // Empty drive configurations are allowed for first-run/uninstalled source.
      if (drives.length) {
        throw new FileStoreError("EINVAL", "Disk mounts do not belong to source system root");
      }
    }
    for (const path of [this.desktopPath, this.trashPath]) {
      if (path === root || !path.startsWith(root + "/")) {
        throw new FileStoreError("EINVAL", "Runtime profile path is outside source system root");
      }
    }
    this.pathConfig = { root, drives, user: runtime.user };
  }

  /** Only mount runtime-provided paths; no generic fake OS folder tree. */
  async mount(): Promise<void> {
    const root = this.pathConfig.root;
    const entries = [
      root,
      ...this.pathConfig.drives.map(d => normalizeFileUri(root + "/" + d.path)),
      this.desktopPath,
      this.trashPath
    ];
    for (const path of entries) await this.ensureDirectory(path);
  }

  private async ensureDirectory(path: string): Promise<void> {
    if (path === "/") return;
    const parent = getParentDirectory(path);
    await this.ensureDirectory(parent);
    const item = await this.store.stat(path);
    if (item?.type === "file") {
      throw new FileStoreError("ENOTDIR", "Source mount is occupied by a file: " + path);
    }
    if (!item) await this.store.mkdir(path);
  }

  toUri(windowsPath: string): string | null {
    return toStorageUri(windowsPath, this.pathConfig);
  }
  toWindowsPath(uri: string): string | null {
    return fromStorageUri(uri, this.pathConfig);
  }
}
