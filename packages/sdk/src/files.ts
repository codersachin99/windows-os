import { FileClipboard, VirtualFileStore, type FileStoreStorage } from "@windows-os/filesystem";
// Shared across future Explorer, Notepad, Recycle Bin, media and file dialogs.
// No host-disk access is implied. Source sessions and mounts are opt-in.
function browserStorage(): FileStoreStorage | undefined {
  if (typeof window === "undefined") return undefined;
  try { return window.localStorage; } catch { return undefined; }
}
export const fileStore = new VirtualFileStore(browserStorage());
export type { FileEntry, FileEntryType, FileStoreErrorCode } from "@windows-os/filesystem";
export { FileStoreError, getFileName, getParentDirectory, normalizeFileUri } from "@windows-os/filesystem";

export { drivesFromLegacyStats, fromStorageUri, parseWindowsPath, resolveWindowsPath, toStorageUri, windowsFileName, windowsParentDirectory, windowsPath } from "@windows-os/filesystem";
export type { LegacyDrive, LegacyPathConfig, LegacyDriveStats } from "@windows-os/filesystem";

export { LegacyVolumeSession, createProfileFileStore } from "@windows-os/filesystem";
export type { LegacyRuntimeMounts, FileStoreChange } from "@windows-os/filesystem";

export const fileClipboard = new FileClipboard();
