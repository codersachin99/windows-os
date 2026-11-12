import {
  FileStoreError, normalizeFileUri, type FileEntry, type VirtualFileStore
} from "./index";
import { transferFiles, type FileTransferMode } from "./transfer";

/**
 * Same-document shell drag (not a serialized host file path).
 * A browser File/drop event cannot forge a valid session token from markup
 * alone. All VFS mutations go through the existing source FileMove/Copy SDK.
 */
export const SHELL_DRAG_TYPE = "application/x-windows-os-files";
export class FileDragSession {
  private current: { token: string; paths: string[] } | null = null;
  private sequence = 0;
  begin(paths: readonly string[]): string {
    if (!paths.length) throw new FileStoreError("EINVAL", "No selected files to drag");
    const token = String(++this.sequence) + ":" + Math.random().toString(36).slice(2);
    this.current = { token, paths: [...new Set(paths.map(normalizeFileUri))] };
    return token;
  }
  snapshot(token: string): readonly string[] | null {
    return this.current?.token === token ? [...this.current.paths] : null;
  }
  end(token: string): void {
    if (this.current?.token === token) this.current = null;
  }
  async drop(
    filesystem: Pick<VirtualFileStore, "stat" | "copy" | "move">,
    token: string,
    directory: string,
    mode: FileTransferMode = "move"
  ): Promise<FileEntry[]> {
    const paths = this.snapshot(token);
    if (!paths) throw new FileStoreError("EINVAL", "Drag session is unavailable");
    return transferFiles(filesystem, paths, directory, mode);
  }
}

/**
 * Mirrors the original Computer's onDrop -> shared _parse operation for host
 * File objects, without importing an unchecked host path. .txt stays readable
 * in native Notepad; all other files preserve original binary bytes.
 */
export async function importDroppedFiles(
  filesystem: Pick<VirtualFileStore, "stat" | "write" | "writeBytes">,
  files: readonly File[],
  destination: string
): Promise<FileEntry[]> {
  if (!files.length) return [];
  const directory = normalizeFileUri(destination);
  if ((await filesystem.stat(directory))?.type !== "directory") {
    throw new FileStoreError("ENOTDIR", "Import destination is not a folder");
  }
  const names = new Set<string>();
  const plan: { file: File; target: string }[] = [];
  for (const file of files) {
    const name = file.name;
    if (!name || name === "." || name === ".." || /[/\\\0]/.test(name)) {
      throw new FileStoreError("EINVAL", "Invalid uploaded filename");
    }
    const folded = name.toLocaleLowerCase();
    if (names.has(folded)) {
      throw new FileStoreError("EEXIST", "Duplicate filenames in upload: " + name);
    }
    names.add(folded);
    const target = normalizeFileUri((directory === "/" ? "" : directory) + "/" + name);
    if (await filesystem.stat(target)) {
      throw new FileStoreError("EEXIST", "Destination already exists: " + target);
    }
    plan.push({ file, target });
  }
  const created: FileEntry[] = [];
  for (const { file, target } of plan) {
    if (/\.txt$/i.test(file.name)) {
      created.push(await filesystem.write(await file.text(), target));
    } else {
      created.push(await filesystem.writeBytes(new Uint8Array(await file.arrayBuffer()), target));
    }
  }
  return created;
}
