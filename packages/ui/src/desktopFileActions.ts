import {SOURCE_COMPUTER_ROOT, getFileName, normalizeFileUri, type FileEntry} from "@windows-os/filesystem";

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
 * the command uses ALL selected shortcut.path entries with an extension
 * except .lnk. A file-backed .lnk with a validated path-backed shortcut target
 * downloads its Guest target, never the .lnk payload itself. Program-only
 * .lnk, synthetic Computer/Bin/apps and directories have no byte download.
 * Keep the predicate independent of the menu's right-clicked item.
 */
export function desktopDownloadableFiles(
  items: readonly { id: string; file?: {
    entry: Pick<FileEntry, "uri" | "name" | "type">;
    targetPath?: string|null;
  } }[],
  selectedKeys: readonly string[]
): Array<Pick<FileEntry, "uri" | "name" | "type">> {
  const selected = new Set(selectedKeys);
  const found = new Set<string>();
  const result: Array<Pick<FileEntry, "uri" | "name" | "type">> = [];
  for (const item of items) {
    if (!selected.has(item.id) || !item.file) continue;
    const entry=item.file.entry;
    const path=item.file.targetPath??entry.uri;
    // SourcePathShortcut parses/validates targets at import. Recheck their
    // normalized mounted Guest scope at this action boundary.
    if(item.file.targetPath){
      try{
        if(path!==normalizeFileUri(path) || !path.startsWith(SOURCE_COMPUTER_ROOT+"/"))
          continue;
      }catch{continue;}
    }
    const name=item.file.targetPath?getFileName(path):entry.name;
    const ext=name.lastIndexOf(".");
    if(entry.type!=="file" || ext<=0 || ext===name.length-1 ||
        /^lnk$/i.test(name.slice(ext+1)) || found.has(path)) continue;
    found.add(path);
    result.push({uri:path,name,type:"file"});
  }
  return result;
}

/**
 * Frozen src/modules/system/main.js DesktopItemMenu:
 * selectedKeys -> getShortcut(key).path -> this.paths, then
 * copyShortcut/cutShortcut dispatch the paths to the shell clipboard.
 *
 * An Explorer-created path-backed .lnk is a shortcut to the selected Guest
 * TARGET, not the selected .lnk JSON file. Program-only .lnk shortcuts have
 * no path and must not enter the file clipboard. Direct Guest icons retain
 * their own path. Target URIs are revalidated at the action boundary.
 *
 * This intentionally does NOT change Desktop delete, drag, rename or zip
 * routing, which require their own source/safety acceptance.
 */
export function desktopSourceClipboardPaths(
  items: readonly {id:string;file?:{
    entry:Pick<FileEntry,"uri"|"name"|"type">;
    targetPath?:string|null;
  }}[],
  selectedKeys:readonly string[]
):string[]{
  const selected=new Set(selectedKeys);
  const paths=new Set<string>();
  for(const item of items){
    if(!selected.has(item.id)||!item.file)continue;
    const entry=item.file.entry;
    const isLink=entry.type==="file"&&/\.lnk$/i.test(entry.name);
    if(isLink&&!item.file.targetPath)continue;
    const path=item.file.targetPath??entry.uri;
    if(item.file.targetPath){
      try{
        if(path!==normalizeFileUri(path)||!path.startsWith(SOURCE_COMPUTER_ROOT+"/"))
          continue;
      }catch{continue;}
    }
    paths.add(path);
  }
  return [...paths];
}
