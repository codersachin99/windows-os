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
