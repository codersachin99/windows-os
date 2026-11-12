import {
  parseSourceShortcut, type FileEntry, type VirtualFileStore
} from "@windows-os/filesystem";
import { legacyArt } from "@windows-os/assets";

export interface SourceDesktopFile {
  id: string;
  label: string;
  icon: string;
  entry: FileEntry;
  /** Existing source .lnk exe ID only; never arbitrary file execution. */
  programId: string | null;
}

async function sourceLinkText(
  store: Pick<VirtualFileStore, "read" | "readBytes">,
  path: string
): Promise<string> {
  try { return await store.read(path); }
  catch {
    // Host-uploaded JSON .lnk is stored as binary by the original File parser.
    // Decode only to inspect the source exe/icon JSON; never execute its data.
    return new TextDecoder("utf-8", { fatal: true }).decode(await store.readBytes(path));
  }
}
/**
 * Source main.js 6271: items combines defaultShortcuts with the per-user
 * shortcuts array; a file-backed shortcut path is read at openItem().
 *
 * React keeps these file entries in the same shared Guest VFS instead of
 * inventing a second desktop JSON catalog. Explicit runtime.desktopPath is
 * passed by the caller; no fabricated /Desktop path or host filesystem read.
 */
export async function listSourceDesktopFiles(
  store: Pick<VirtualFileStore, "list" | "read" | "readBytes">,
  desktopPath: string
): Promise<SourceDesktopFile[]> {
  const children = await store.list(desktopPath);
  return Promise.all(children.map(async entry => {
    const isLink = entry.type === "file" && /\.lnk$/i.test(entry.name);
    let programId: string | null = null;
    if (isLink) {
      try {
        programId = parseSourceShortcut(await sourceLinkText(store, entry.uri))?.exe ?? null;
      } catch { /* unsupported host .lnk is displayed as an unassociated file */ }
    }
    const label = isLink ? entry.name.slice(0, -4) : entry.name;
    return {
      id: "file:" + entry.uri,
      label,
      icon: entry.type === "directory" ? legacyArt.folder : legacyArt.file,
      entry,
      programId
    };
  }));
}
