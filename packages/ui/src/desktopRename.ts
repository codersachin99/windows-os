import {
  FileStoreError, getParentDirectory, type FileEntry,
  type VirtualFileStore
} from "@windows-os/filesystem";

/**
 * Source reference: legacy-win7 main.js c5f4 item.rename() dispatches
 * FileRename(path,name), with the filename extension edited separately and
 * the original input maxlength=30. Only user-backed Desktop file entries
 * may reach this operation; built-in Bin/Computer IDs have no VFS path.
 */
export function desktopEditableName(entry: Pick<FileEntry, "name" | "type">): string {
  if (entry.type === "directory") return entry.name;
  const dot = entry.name.lastIndexOf(".");
  return dot > 0 ? entry.name.slice(0, dot) : entry.name;
}
export function desktopFileExtension(entry: Pick<FileEntry, "name" | "type">): string {
  if (entry.type === "directory") return "";
  const dot = entry.name.lastIndexOf(".");
  return dot > 0 ? entry.name.slice(dot) : "";
}
export async function renameSourceDesktopFile(
  store: Pick<VirtualFileStore,"stat" | "list" | "move">,
  entry: FileEntry,
  editedBaseName: string
): Promise<string> {
  if (typeof editedBaseName !== "string") {
    throw new FileStoreError("EINVAL","Invalid filename");
  }
  const name = editedBaseName.trim();
  if (!name || name.length > 30 || /[\\/:*?"<>|\0-\x1f]/.test(name)
    || name === "." || name === ".." || name.endsWith(".")
    || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\..*)?$/i.test(name)) {
    throw new FileStoreError("EINVAL", "Invalid desktop file name");
  }
  const complete = name + desktopFileExtension(entry);
  const folder = getParentDirectory(entry.uri);
  const to = folder === "/" ? "/" + complete : folder + "/" + complete;
  if (to === entry.uri) return entry.uri;
  if (!(await store.stat(entry.uri))) {
    throw new FileStoreError("ENOENT", "File no longer exists");
  }
  const existing = await store.list(folder);
  if (existing.some(item => item.uri !== entry.uri &&
    item.name.toLocaleLowerCase() === complete.toLocaleLowerCase())) {
    throw new FileStoreError("EEXIST", "A desktop item with that name already exists");
  }
  await store.move(entry.uri, to);
  return to;
}
