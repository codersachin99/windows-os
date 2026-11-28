import {
  FileStoreError, normalizeFileUri, type FileEntry, type VirtualFileStore
} from "./index";
import {SOURCE_COMPUTER_ROOT,SOURCE_GUEST_PROFILE} from "./sourceGuest";
import {sourceFileIconType,sourceIsShortcutEntry} from "./sourceIconTypes";

/** Pinned legacy src/modules/system/main.js ExplorerItemMenu.sendToDesktop
 * writes a text-backed .lnk with {exe,icon,path} for each selected Guest item.
 * Unlike installed-program shortcuts (without path), these are never executed
 * by their exe field; the actual Guest target is resolved and checked on open.
 */
export interface SourcePathShortcut {
  exe:string;
  icon:string;
  path:string;
}
const DESKTOP=SOURCE_GUEST_PROFILE+"/Desktop";
function validSourceTarget(value:unknown):value is string{
  if(typeof value!=="string"||value.length>4096)return false;
  try{
    return value===normalizeFileUri(value)
      &&value.startsWith(SOURCE_COMPUTER_ROOT+"/")
      &&!value.includes("\\")
      &&!/(?:^|\/)\.\.?\//.test(value);
  }catch{return false;}
}
export function parseSourcePathShortcut(text:string):SourcePathShortcut|null{
  try{
    const parsed:unknown=JSON.parse(text);
    if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))return null;
    const data=parsed as Record<string,unknown>;
    if(!validSourceTarget(data.path)
      ||typeof data.exe!=="string"||!/^[a-z][a-z0-9_-]{0,63}$/.test(data.exe)
      ||typeof data.icon!=="string"||!data.icon.length||data.icon.length>1024)
      return null;
    // Original link target resolution is not yet recursive. A linked .lnk
    // could cycle back into itself and must not trigger host execution.
    if(/\.[^.]*lnk$/i.test(data.path))return null;
    return {exe:data.exe,icon:data.icon,path:data.path};
  }catch{return null;}
}
function shortcutBaseName(entry:FileEntry):string{
  const stem=entry.type==="file"?entry.name.replace(/\.[^.]*$/,""):entry.name;
  const safe=stem.replace(/[\\/:*?"<>|\0-\x1f]/g,"").trim();
  if(!safe||safe==="."||safe===".."||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i.test(safe))
    throw new FileStoreError("EINVAL","Invalid shortcut display name");
  return safe.slice(0,140);
}
export function sourcePathShortcutContent(entry:FileEntry):string{
  if(!validSourceTarget(entry.uri)||sourceIsShortcutEntry(entry))
    throw new FileStoreError("EINVAL","Only mounted Guest files/folders can be linked");
  // The original webpack 4cca file-kind key is a safe metadata hint only;
  // never use this to invoke an arbitrary executable or a host OS path.
  const type=sourceFileIconType(entry);
  return JSON.stringify({exe:type,icon:type,path:entry.uri});
}
/** Create all selected shortcuts atomically so a multi-selection cannot
 * leave half a desktop if quota/collision validation fails. Source creates
 * one shortcut per path and uses its basename with ' - Shortcut.lnk'.
 */
export async function createSourcePathDesktopShortcuts(
  store:Pick<VirtualFileStore,"stat"|"list"|"createFilesAtomic">,
  desktopPath:string, paths:readonly string[]
):Promise<string[]>{
  if(desktopPath!==DESKTOP)
    throw new FileStoreError("EINVAL","Source Guest Desktop is not mounted");
  if(!(await store.stat(DESKTOP))||((await store.stat(DESKTOP))?.type!=="directory"))
    throw new FileStoreError("ENOENT","Guest Desktop is not a directory");
  const selected=[...new Set(paths)];
  if(!selected.length)return [];
  const taken=new Set((await store.list(DESKTOP)).map(item=>item.name.toLowerCase()));
  const writes:{path:string;content:string}[]=[];
  for(const path of selected){
    if(!validSourceTarget(path))
      throw new FileStoreError("EINVAL","Invalid Guest shortcut target");
    const entry=await store.stat(path);
    if(!entry||entry.originalPath||sourceIsShortcutEntry(entry))
      throw new FileStoreError("EINVAL","Shortcut target must be a live Guest item");
    const label=shortcutBaseName(entry)+" - Shortcut";
    let candidate="";
    for(let number=1;number<=9999;number++){
      const name=label+(number===1?"":" ("+number+")")+".lnk";
      if(!taken.has(name.toLowerCase())){candidate=name;break;}
    }
    if(!candidate)throw new FileStoreError("EEXIST","No available shortcut name");
    taken.add(candidate.toLowerCase());
    writes.push({path:DESKTOP+"/"+candidate,content:sourcePathShortcutContent(entry)});
  }
  await store.createFilesAtomic(writes);
  return writes.map(write=>write.path);
}
