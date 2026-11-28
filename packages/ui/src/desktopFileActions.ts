import {SOURCE_COMPUTER_ROOT, getFileName, getParentDirectory, normalizeFileUri, sourceCanCompressSelection, type FileEntry} from "@windows-os/filesystem";

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

/**
 * Frozen DesktopItemMenu Send to > compressed folder calls compress(this.paths),
 * the SAME getShortcut(id).path selection used for Cut/Copy.
 * The shared ZIP adapter currently accepts one mounted Guest parent directory
 * per operation; refuse mixed-folder selections instead of archiving a
 * shortcut's JSON payload, crossing host boundaries or moving the results.
 */
export function desktopSourceArchiveSelection(
  items: Parameters<typeof desktopSourceClipboardPaths>[0],
  selectedKeys: readonly string[]
):{folder:string;paths:string[]}|null{
  const paths=desktopSourceClipboardPaths(items,selectedKeys);
  if(!paths.length)return null;
  const folder=getParentDirectory(paths[0]);
  return sourceCanCompressSelection(folder,paths)?{folder,paths}:null;
}

/**
 * Desktop pointer drag onto Recycle Bin is an existing React convenience,
 * NOT a capability asserted by frozen main.js (its dropIcons repositions
 * shortcuts). Restrict the convenience to real, direct Desktop Guest entries.
 * A path-backed .lnk is a pointer to a DIFFERENT Guest document; implicitly
 * recycling the JSON shortcut or its target on a drag would risk data loss.
 * Program-only .lnk, synthetic system icons and mixed groups are rejected
 * atomically. Explicit source Delete has a separate confirmation lifecycle.
 */
export function desktopSafeBinDragPaths(
  items: readonly {id:string;file?:{
    entry:Pick<FileEntry,"uri"|"name"|"type">;targetPath?:string|null
  }}[],
  selectedKeys:readonly string[]
):string[]|null{
  if(!selectedKeys.length)return null;
  const byId=new Map(items.map(item=>[item.id,item]));
  const paths=new Set<string>();
  for(const id of selectedKeys){
    const file=byId.get(id)?.file;
    if(!file||/\.lnk$/i.test(file.entry.name)||file.targetPath)return null;
    try{
      const path=file.entry.uri;
      if(path!==normalizeFileUri(path)||!path.startsWith(SOURCE_COMPUTER_ROOT+"/"))
        return null;
      paths.add(path);
    }catch{return null;}
  }
  return paths.size?[...paths]:null;
}

/**
 * Pinned main.js DesktopItemMenu: watcher stores selected shortcut.path
 * entries in this.paths, then isMultiple is `this.paths.length > 1`.
 * Count source path-bearing SELECTED ICONS, not highlighted icon count and
 * not the distinct URI count returned by the transfer clipboard.
 *
 * Selecting Computer/Bin or a program-only .lnk alongside ONE real Guest
 * file does not hide Open/Rename/Properties/Extract here in the original.
 * Two different shortcut icons pointing at one target count as two paths.
 * Reuse the validated target-path resolution from the actual clipboard;
 * invalid and unmounted shortcut targets cannot force extra menu actions.
 */
export function desktopSourceItemMenuPathCount(
  items: Parameters<typeof desktopSourceClipboardPaths>[0],
  selectedKeys: readonly string[]
):number{
  const byId=new Map(items.map(item=>[item.id,item]));
  let count=0;
  for(const id of new Set(selectedKeys)){
    const item=byId.get(id);
    if(item?.file&&desktopSourceClipboardPaths([item],[id]).length>0)
      count++;
  }
  return count;
}
