import {sourceFileIconType,sourceIsShortcutEntry,sourceShortcutIconValue,readSourceShortcutText,type FileEntry,type VirtualFileStore} from "@windows-os/filesystem";
import {sourceThemeFileIconArtwork} from "@windows-os/assets";

/** Frozen f0aa.describeEntry/readShortcutIcon: a shortcut's JSON icon
 * is independent of its executable target. Reuse Computer/Desktop artwork
 * resolution, including binary uploads and the original missing-icon fallback. */
export async function sourceSearchFileArtwork(
  store:Pick<VirtualFileStore,"read"|"readBytes">,theme:string,file:FileEntry
){
  let override:string|null=null;
  if(sourceIsShortcutEntry(file)){
    try{override=sourceShortcutIconValue(await readSourceShortcutText(store,file.uri));}
    catch{override="file";}
  }
  return sourceThemeFileIconArtwork(theme,sourceFileIconType(file),override);
}
