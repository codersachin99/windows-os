import {
  parseSourceShortcut, parseSourcePathShortcut,
  sourceShortcutIconValue, readSourceShortcutText, sourceFileIconType,
  sourceIsShortcutEntry, type FileEntry, type VirtualFileStore
} from "@windows-os/filesystem";
import {
  legacySourceIconArtwork,legacySourceCustomIconURL,sourceThemeFileIconArtwork
} from "@windows-os/assets";
import type {ThemeId} from "@windows-os/contracts";

export interface SourceDesktopFile {
  id: string;
  label: string;
  icon: string;
  entry: FileEntry;
  /** Existing source .lnk exe ID only; never arbitrary file execution. */
  programId: string | null;
  /** Source main.js SendToDesktop .lnk references a bounded Guest file path. */
  targetPath: string | null;
  iconType: string;
  iconOverride: string | null;
  artwork: "original" | "fallback" | "custom";
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
    const isLink=sourceIsShortcutEntry(entry);
    const iconType=sourceFileIconType(entry);
    let programId:string|null=null;
    let targetPath:string|null=null;
    let iconOverride:string|null=null;
    if(isLink){
      try{
        const text=await readSourceShortcutText(store,entry.uri);
        targetPath=parseSourcePathShortcut(text)?.path??null;
        programId=targetPath?null:parseSourceShortcut(text)?.exe??null;
        iconOverride=sourceShortcutIconValue(text);
      }catch{
        // Corrupt host binary: show the source's generic file icon,
        // without granting executable launch permission.
        iconOverride="file";
      }
    }
    const iconKey=iconOverride??iconType;
    const resolved=legacySourceIconArtwork(iconKey);
    const label=isLink&&/\.lnk$/i.test(entry.name)?entry.name.slice(0,-4):entry.name;
    return {
      id:"file:"+entry.uri,label,icon:resolved.src,entry,programId,targetPath,
      iconType,iconOverride,
      artwork:resolved.exactSourceArtwork?"original":
        legacySourceCustomIconURL(iconKey)?"custom":"fallback"
    };
  }));
}

/** Use the same source theme icon rule as Computer for VFS-backed Desktop
 * entries; user JSON .lnk icons stay authoritative over theme generic art.
 */
export function sourceDesktopFileArtwork(
  file:SourceDesktopFile,theme:ThemeId="win7"
):Pick<SourceDesktopFile,"icon"|"artwork">{
  const resolved=sourceThemeFileIconArtwork(theme,file.iconType,file.iconOverride);
  return {icon:resolved.src,artwork:resolved.exactSourceArtwork?"original":
    legacySourceCustomIconURL(file.iconOverride??"")?"custom":"fallback"};
}
