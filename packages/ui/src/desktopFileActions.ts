import type { FileEntry } from "@windows-os/filesystem";

/** Source main.js desktop selectedKeys -> getShortcut(path) -> shell file actions.
 * System icons are selectable but have no actual file path and are excluded.
 */
export function desktopSelectedFilePaths(
  items: readonly { id: string; file?: { entry: Pick<FileEntry, "uri"> } }[],
  keys: readonly string[]
): string[] {
  const selected = new Set(keys);
  const paths = new Set<string>();
  for (const item of items) {
    if (selected.has(item.id) && item.file) paths.add(item.file.entry.uri);
  }
  return [...paths];
}

/**
 * Pinned src/modules/system/main.js DesktopItemMenu.downloadablePaths:
 * the command uses ALL selected path-backed entries with an extension except
 * .lnk. Synthetic Computer/Bin/apps and directories have no byte download.
 * Keep the predicate independent of the menu's right-clicked item.
 */
export function desktopDownloadableFiles(
  items: readonly { id: string; file?: {entry: Pick<FileEntry, "uri" | "name" | "type">} }[],
  selectedKeys: readonly string[]
): Array<Pick<FileEntry, "uri" | "name" | "type">> {
  const selected = new Set(selectedKeys);
  const found = new Set<string>();
  const result: Array<Pick<FileEntry, "uri" | "name" | "type">> = [];
  for (const item of items) {
    if (!selected.has(item.id) || !item.file) continue;
    const entry=item.file.entry;
    const ext=entry.name.lastIndexOf(".");
    if (entry.type!=="file" || ext<=0 || ext===entry.name.length-1 ||
        /^lnk$/i.test(entry.name.slice(ext+1)) || found.has(entry.uri)) continue;
    found.add(entry.uri);
    result.push(entry);
  }
  return result;
}
