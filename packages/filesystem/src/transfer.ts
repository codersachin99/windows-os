import {
  FileStoreError, getFileName, normalizeFileUri,
  type FileEntry, type VirtualFileStore
} from "./index";

export type FileTransferMode = "copy" | "move";
type TransferStore = Pick<VirtualFileStore, "stat" | "copy" | "move">
  & Partial<Pick<VirtualFileStore, "transferMany">>;

/**
 * Shared source FileCopy/FileMove entry point for Explorer, Desktop, clipboard
 * and shell drag. Mounted VirtualFileStore uses transferMany: one persisted
 * snapshot for every selected root and its descendants. The compatibility
 * fallback is for adapters without transferMany and does not promise
 * cross-file storage atomicity.
 */
export async function transferFiles(
  filesystem: TransferStore,
  paths: readonly string[],
  destination: string,
  mode: FileTransferMode
): Promise<FileEntry[]> {
  if (filesystem.transferMany) return filesystem.transferMany(paths, destination, mode);
  if (!paths.length) throw new FileStoreError("EINVAL", "No files selected");
  const folder = normalizeFileUri(destination);
  if ((await filesystem.stat(folder))?.type !== "directory") {
    throw new FileStoreError("ENOTDIR", "Paste destination is not a folder");
  }
  const unique = [...new Set(paths.map(normalizeFileUri))];
  if (unique.includes("/")) throw new FileStoreError("EINVAL", "Cannot transfer filesystem root");
  const sources = unique.filter(path =>
    !unique.some(parent => path !== parent && path.startsWith(parent + "/")));
  const plan = sources.map(from => ({
    from, to: normalizeFileUri((folder === "/" ? "" : folder) + "/" + getFileName(from))
  }));
  if (new Set(plan.map(item => item.to)).size !== plan.length) {
    throw new FileStoreError("EEXIST", "Selected files share a destination name");
  }
  for (const { from, to } of plan) {
    if (!(await filesystem.stat(from))) {
      throw new FileStoreError("ENOENT", "Source no longer exists: " + from);
    }
    if (to === from || to.startsWith(from + "/")) {
      throw new FileStoreError("EINVAL", "Cannot paste into the same file or a nested folder");
    }
    if (await filesystem.stat(to)) {
      throw new FileStoreError("EEXIST", "Destination already exists: " + to);
    }
  }
  const result: FileEntry[] = [];
  for (const { from, to } of plan) {
    if (mode === "move") await filesystem.move(from, to);
    else await filesystem.copy(from, to);
    const entry = await filesystem.stat(to);
    if (entry) result.push(entry);
  }
  return result;
}
